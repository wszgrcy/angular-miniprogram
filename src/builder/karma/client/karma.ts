import { IO } from './platform';
import { StatusUpdater } from './updater';

export class KarmaClient {
  /** 是否正式发射判断? */
  private startEmitted = false;

  public config: Record<string, any> = {};
  /** socket重连接标记 */
  private socketReconnect = false;
  private resultsBufferLimit = 50;
  private resultsBuffer: any[] = [];
  private returnUrl!: string;
  readonly id: string = Math.random().toString(36).slice(2);
  constructor(private updater: StatusUpdater, private socket: IO) {
    socket.on('execute', (cfg) => {
      this.updater.updateTestStatus('execute');
      // reset startEmitted and reload the iframe
      this.startEmitted = false;
      this.config = cfg;
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
    error?: Error
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
      this.socket.emit('start', { total: null });
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
          this.config.allowedReturnUrlPatterns[i]
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
            ' was blocked to prevent malicious exploits.'
          )
        );
      }
    }
  }
  /** 可以直接使用 */
  info(info: any) {
    // TODO(vojta): introduce special API for this
    if (!this.startEmitted && info.total) {
      this.socket.emit('start', info);
      this.startEmitted = true;
    } else {
      this.socket.emit('info', info);
    }
  }
}
