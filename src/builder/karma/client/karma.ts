import { IO } from './platform';
import { StatusUpdater } from './updater';

export class KarmaClient {
  /** 是否正式发射判断? */
  private startEmitted = false;

  /**
   * 已经报过的 spec 总数。
   *
   * karma 服务端 `onStart` 里是 `lastResult = new BrowserResult(info.total)`，
   * 意思是**每发一次 start 都会重置总数**。而 `socket.on('execute')` 会把
   * `startEmitted` 清零，于是 `result()` 会再发一次 start；原来那里硬写
   * `{ total: null }`，就把 `jasmineStarted` 已经报过的真实总数顶掉了，
   * 表现为 `Executed 13 of null`——永远拿不到「应该跑几个」，
   * 只能靠猜静默判断跑完。
   *
   * 实测序列（客户端实例 c1）：
   *   info total=13 event=jasmineStarted startEmitted=false   → 发 start(13)，置 true
   *   info total=undefined event=suiteStarted startEmitted=true
   *   result() startEmitted=false                            ← 被 execute 顶掉了
   *   → 发出 start{total:null}，13 就这么没了
   *
   * 把总数单独记下来，重发 start 时带上，就不会丢。
   */
  private totalReported: number | null = null;

  public config: Record<string, any> = {};
  /** socket重连接标记 */
  private socketReconnect = false;
  /**
   * 结果批量上报的阈值。
   *
   * 原来是 50，但 spec 数少于 50 时永远凑不满，结果全堆在 buffer 里，
   * 只有 jasmineDone 才 flush。后果是跑的过程中 karma 一条消息都收不到，
   * 30s 无活动就被判死（"no message in 30000 ms"），而且完全看不到进度。
   * 设成 1：每条结果立刻上报，跟 karma 官方 adapter 行为一致。
   */
  private resultsBufferLimit = 1;
  private resultsBuffer: any[] = [];
  private returnUrl!: string;
  readonly id: string = 'miniprogram';
  constructor(
    private updater: StatusUpdater,
    private socket: IO,
  ) {
    socket.on('execute', (cfg) => {
      this.updater.updateTestStatus('execute');
      this.config = cfg;
      // 注意：这里**不能**跟着网页客户端那样重置 startEmitted。
      //
      // karma 网页端那句 `startEmitted = false` 是配着「重载 iframe」用的：
      //   execute → iframe 重载 → jasmine 从头再跑 → 新的 jasmineStarted
      //   → 再发一次带 total 的 start。重置和重跑是一对。
      //
      // 小程序没有 iframe 可重载，重置之后并不会重跑。于是下一次
      // result() 发现 startEmitted=false，就补发一个裸 start，
      // 而服务端 onStart 是 `lastResult = new BrowserResult(...)`，
      // 计数器当场归零——已经跑完的 spec 就这么被抹掉了。
      // 实测：
      //   Executed 1 of 2 → Executed 0 of 2 → Executed 1 of 2 → 收尾
      // 两个 spec 实际都跑了，但只记到 1 个。
      //
      // 本架构下每次跑都是重新编译、新建 client 实例，startEmitted
      // 本来就是每实例一次，不需要在这里手动复位。
    });
    socket.on('stop', () => {
      this.complete();
    });

    // 初始化的时候自动有这个.
    socket.on('connect', () => {
      socket.emit('register', {
        name: '小程序',
        id: this.id,
        isSocketReconnect: this.socketReconnect,
      });
      this.socketReconnect = true;
    });
  }
  private navigateContextTo(url: string) {}
  log(type: string, args: any[]) {
    const values: any[] = [];

    for (let i = 0; i < args.length; i++) {
      values.push(JSON.stringify(args[i]));
    }

    this.info({ log: values.join(', '), type: type });
  }

  private getLocation(url?: string, lineno?: string, colno?: string) {
    let location = '';

    if (url !== undefined) {
      location += url;
    }

    if (lineno !== undefined) {
      location += ':' + lineno;
    }

    if (colno !== undefined) {
      location += ':' + colno;
    }

    return location;
  }

  error(
    messageOrEvent: string | Error,
    source?: string,
    lineno?: string,
    colno?: string,
    error?: Error,
  ) {
    let message: string | Record<string, any>;
    if (typeof messageOrEvent === 'string') {
      message = messageOrEvent;

      const location = this.getLocation(source, lineno, colno);
      if (location !== '') {
        message += '\nat ' + location;
      }
      if (error && error.stack) {
        message += '\n\n' + error.stack;
      }
    } else {
      // create an object with the string representation of the message to
      // ensure all its content is properly transferred to the console log
      message = { message: messageOrEvent, str: messageOrEvent.toString() };
    }

    this.socket.emit('karma_error', message);
    this.updater.updateTestStatus('karma_error ' + message);
    this.complete();
    return false;
  }
  result(originalResult: Record<string, any>) {
    const convertedResult: Record<string, any> = {};

    // Convert all array-like objects to real arrays.
    for (const propertyName in originalResult) {
      if (Object.prototype.hasOwnProperty.call(originalResult, propertyName)) {
        const propertyValue = originalResult[propertyName];

        if (
          Object.prototype.toString.call(propertyValue) === '[object Array]'
        ) {
          convertedResult[propertyName] =
            Array.prototype.slice.call(propertyValue);
        } else {
          convertedResult[propertyName] = propertyValue;
        }
      }
    }

    if (!this.startEmitted) {
      // 带上已知的总数，别用 null 把 jasmineStarted 报过的值顶掉。
      this.socket.emit('start', { total: this.totalReported });
      this.updater.updateTestStatus('start');
      this.startEmitted = true;
    }

    if (this.resultsBufferLimit === 1) {
      this.updater.updateTestStatus('result');
      return this.socket.emit('result', convertedResult);
    }

    this.resultsBuffer.push(convertedResult);

    if (this.resultsBuffer.length === this.resultsBufferLimit) {
      this.socket.emit('result', this.resultsBuffer);
      this.updater.updateTestStatus('result');
      this.resultsBuffer = [];
    }
  }

  complete(result?: Record<string, any>) {
    if (this.resultsBuffer.length) {
      this.socket.emit('result', this.resultsBuffer);
      this.resultsBuffer = [];
    }

    this.socket.emit('complete', result || {});
    if (this.config.clearContext) {
      this.navigateContextTo('about:blank');
    } else {
      this.updater.updateTestStatus('complete');
    }
    if (this.returnUrl) {
      let isReturnUrlAllowed = false;
      for (let i = 0; i < this.config.allowedReturnUrlPatterns.length; i++) {
        const allowedReturnUrlPattern = new RegExp(
          this.config.allowedReturnUrlPatterns[i],
        );
        if (allowedReturnUrlPattern.test(this.returnUrl)) {
          isReturnUrlAllowed = true;
          break;
        }
      }
      if (!isReturnUrlAllowed) {
        throw new Error(
          'Security: Navigation to '.concat(
            this.returnUrl,
            ' was blocked to prevent malicious exploits.',
          ),
        );
      }
    }
  }
  /** 可以直接使用 */
  info(info: any) {
    // TODO(vojta): introduce special API for this
    if (info && info.total) {
      this.totalReported = info.total;
    }
    if (!this.startEmitted && info.total) {
      this.socket.emit('start', info);
      this.startEmitted = true;
    } else {
      this.socket.emit('info', info);
    }
  }
}
