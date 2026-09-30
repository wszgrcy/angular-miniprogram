# angular-miniprogram/api

统一小程序 API 层（对标 uni-app 的 `uni.xxx`），root 单例，Angular 服务风格。

```ts
import { MpApiService, MpEventBus } from 'angular-miniprogram/api';

@Component({ ... })
export class Demo {
  private api = inject(MpApiService);
  private bus = inject(MpEventBus);

  async go() {
    await this.api.navigateTo('/pages/detail/detail-entry');
    const res = await this.api.showModal({ content: '确定？' }); // 跨家归一
    if (res.confirm) {
      this.api.showToast('已确定');
    }
  }
}
```

## 组成

| 导出 | 说明 |
|---|---|
| `MpApiService` | 统一 API 入口：类型化方法 + `invoke(name, options)` 泛化入口 + 拦截器 |
| `MpEventBus` | 全局事件总线（`on/once/off/emit`，`on` 返回退订函数） |
| `MP_PLATFORM` | 运行时平台标识（`wx/my/tt/swan/qq/dd/jd`），可 override 用于测试 |
| `MP_API_PROTOCOLS` | 平台差异协议表，可替换/扩展 |

## 调用管线

`invoke(name, options)` → Promise 化判定 → 拦截器 → 平台协议归一化 → 平台全局对象。

- **Promise 化**：未传 `success/fail/complete` 且非 `*Sync` / `create*` / `on*` / task 类时返回 Promise（规则同 uni）
- **task 类**（`request/uploadFile/downloadFile/connectSocket`）返回 task
- 所有回调经 `ɵChangeDetectionScheduler` 通知变更检测，不依赖 zone

## 拦截器（语义对齐 uni addInterceptor）

```ts
// 登录拦截：未登录时阻断跳转
api.addInterceptor('navigateTo', {
  invoke: (ctx) => (auth.loggedIn ? ctx : (auth.toLogin(), false)),
});

// 全局埋点
api.addInterceptor({
  success: (res, options) => {
    track(options, res);
    return res;
  },
});

api.removeInterceptor('navigateTo', interceptor);
```

- `invoke` 返回 `false` 阻断调用（Promise 永不落定，同 uni）
- `success/fail/complete` 返回值替换结果；支持异步钩子
- `returnValue` 改写同步返回值（task 包装）

## 平台协议（已内置的高频差异归一）

- 支付宝：`showModal→alert/confirm`、`setNavigationBarTitle→setNavigationBar`、
  剪贴板、`getNetworkType` 值域、`makePhoneCall phoneNumber→number`、
  `previewImage current(url)→下标`、`showActionSheet` 对象项→字符串
- 钉钉：`request→httpRequest`、`showModal→alert/confirm`、导航栏、剪贴板

未收录的差异可通过 provide `MP_API_PROTOCOLS` 自行补充。
