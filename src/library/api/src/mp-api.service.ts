/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  ɵChangeDetectionScheduler as ChangeDetectionScheduler,
  Injectable,
  ɵNotificationSource as NotificationSource,
  inject,
} from '@angular/core';
import { MINIPROGRAM_GLOBAL_TOKEN } from 'angular-miniprogram/platform';
import {
  Observable,
  Subject,
  defer,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { MpContext, mpContext } from './context-wrapper';
import {
  MpAccelerometerReading,
  MpAddPhoneContactOptions,
  MpAnimation,
  MpAnimationConfig,
  MpAuthorizeSetting,
  MpBLECharacteristicResult,
  MpBLECharacteristicTargetOptions,
  MpBLECharacteristicsResult,
  MpBLEDeviceIdOptions,
  MpBLEServicesResult,
  MpBeacon,
  MpBeaconsResult,
  MpBluetoothDevice,
  MpBluetoothDevicesResult,
  MpCanvasImageData,
  MpCanvasImageDataOptions,
  MpCanvasToTempFilePathOptions,
  MpChooseFileOptions,
  MpChooseImageOptions,
  MpChooseLocationOptions,
  MpChooseVideoOptions,
  MpChosenLocation,
  MpClipboardData,
  MpCloseSocketOptions,
  MpCompassReading,
  MpCompressImageOptions,
  MpCompressVideoOptions,
  MpConnectSocketOptions,
  MpCreateInnerAudioContextOptions,
  MpFileInfo,
  MpFilePathOptions,
  MpGetFileInfoOptions,
  MpGetImageInfoOptions,
  MpGetLocationOptions,
  MpGetProviderOptions,
  MpGetVideoInfoOptions,
  MpImageInfo,
  MpLoadFontFaceOptions,
  MpLoadSubPackageOptions,
  MpLocation,
  MpLoginOptions,
  MpLoginResult,
  MpMakePhoneCallOptions,
  MpNotifyBLEChangeOptions,
  MpOpenDocumentOptions,
  MpOpenLocationOptions,
  MpPageScrollToOptions,
  MpPaymentOptions,
  MpPaymentResult,
  MpPreviewImageOptions,
  MpProvidersResult,
  MpSaveFileOptions,
  MpSavedFileInfo,
  MpSavedFileListResult,
  MpScanCodeOptions,
  MpScanCodeResult,
  MpScreenBrightnessResult,
  MpSelectedTextRange,
  MpSendSocketMessageOptions,
  MpSetBLEMTUOptions,
  MpSetClipboardDataOptions,
  MpSetKeepScreenOnOptions,
  MpSetNavigationBarColorOptions,
  MpSetNavigationBarTitleOptions,
  MpSetScreenBrightnessOptions,
  MpShareOptions,
  MpShowKeyboardOptions,
  MpSoterAuthenticationResult,
  MpStartAccelerometerOptions,
  MpStartBeaconDiscoveryOptions,
  MpStartLocationUpdateOptions,
  MpStorageOptions,
  MpStorageResult,
  MpSystemSetting,
  MpTabBarBadgeOptions,
  MpTabBarIndexOptions,
  MpTabBarItemOptions,
  MpTabBarStyleOptions,
  MpVideoInfo,
} from './domain-types';
import { MpEventChannel } from './event-channel';
import {
  MpInvokeContext,
  MpPipeRegistry,
  MpPipeSet,
  pipeThrough,
  toAbortError,
} from './pipe-registry';
import { MP_PLATFORM } from './platform';
import {
  MpApiReturn,
  MpResultOf,
  MpStreamOf,
  hasCallbackHandlers,
  isTaskApi,
  shouldPromise,
} from './promisify';
import { applyFieldMap } from './protocol-engine';
import {
  GENERIC_RESULT_NORMALIZERS,
  MP_API_PROTOCOLS,
  MpApiProtocol,
} from './protocols';
import {
  buildAppBaseInfo,
  buildDeviceInfo,
  buildWindowInfo,
  enhanceSystemInfo,
} from './system-info';
import {
  MpApiNameInput,
  MpCallbackOptions,
  MpLoadingOptions,
  MpNavigateBackOptions,
  MpNavigateOptions,
  MpToastOptions,
} from './types';
import {
  MP_API_SCHEMAS,
  MpApiSchema,
  mergeSchemas,
  mpValidationPipe,
} from './validation';

/**
 * 统一小程序 API 服务（root 单例），对标 uni-app 的 uni.xxx 层。
 *
 * rxjs 冷流管线：
 *
 *   invoke$(name, options)
 *     -> of(ctx) -> pre pipes（改写参数 / blockWith 阻断）
 *     -> switchMap(真正调用)   <- 订阅才发生
 *     -> post pipes（改写结果 / 埋点 / catchError）
 *     -> 平台协议归一化（API 名 / 参数 / 结果）在调用层内完成
 *
 * 返回形态：
 * - `invoke$` 可订阅冷流；`invoke` 返回 Promise（急切订阅）
 * - task 类同步返回 task（异步 pre 管道不适用，物理限制）
 * - 同步 API（*Sync / create* / on* 等）直接返回原始值
 * - AbortSignal：未发起即取消 / in-flight 取消（task 类自动 abort）
 *
 * 所有回调经 `ɵChangeDetectionScheduler` 通知变更检测，不依赖 zone。
 */
@Injectable({ providedIn: 'root' })
export class MpApiService {
  private readonly globalObject = inject(MINIPROGRAM_GLOBAL_TOKEN) as Record<
    string,
    any
  >;
  private readonly platform = inject(MP_PLATFORM);
  private readonly protocols = inject(MP_API_PROTOCOLS);
  private readonly scheduler = inject(ChangeDetectionScheduler);
  private readonly registry = inject(MpPipeRegistry);
  private readonly eventChannels = new Map<number, MpEventChannel>();
  private channelSeq = 0;

  constructor() {
    // 守卫必须内联写：包成 `isMpDevMode()` 后打包器无法证明分支已死，
    // schema 会跟整进生产包（实测 15KB vs 147B）。
    if (typeof ngDevMode !== 'undefined' && ngDevMode) {
      const raw = inject(MP_API_SCHEMAS, { optional: true });
      const contributions: Record<string, MpApiSchema>[] = Array.isArray(raw)
        ? (raw as Record<string, MpApiSchema>[])
        : raw
          ? [raw as Record<string, MpApiSchema>]
          : [];
      this.registry.setCorePipes({
        pre: [mpValidationPipe(mergeSchemas(contributions))],
      });
    }
  }

  // ---------------------------------------------------------------- 管道拦截

  /**
   * 按 API 注册管道：`const h = api.setPipe('navigateTo', { pre: [...] })`
   * 返回句柄，`h.dispose()` 即撤销本次注册。
   */
  setPipe(name: MpApiNameInput, set: MpPipeSet) {
    return this.registry.setPipes(name, set);
  }

  removePipe(name: MpApiNameInput) {
    this.registry.removePipes(name);
  }

  /** 全局管道（对所有 API 生效），同样返回可 dispose 的句柄 */
  setGlobalPipes(set: MpPipeSet) {
    return this.registry.setGlobalPipes(set);
  }

  clearGlobalPipes() {
    this.registry.clearGlobalPipes();
  }

  // ---------------------------------------------------------------- 通用调用

  /**
   * 冷流入口：订阅才发起调用，全程可管道干预。
   * 用户回调（若传）作为旁路观察者在 post 管道之后触发，
   * 看到的同样是归一/改写后的结果。
   */
  invoke$<N extends MpApiNameInput, T = MpStreamOf<N>>(
    name: N,
    options: MpCallbackOptions = {},
  ): Observable<T> {
    return defer(() => {
      const { cbs, rest } = this.extractCallbacks(options);
      const ctx: MpInvokeContext = { name, options: rest };
      let stream$: Observable<any> = pipeThrough(of(ctx), [
        ...this.registry.prePipes(name),
        switchMap((c) => this.callObservable<T>(c)),
        ...this.registry.postPipes(name),
      ]);
      if (cbs) {
        let lastRes: any;
        stream$ = stream$.pipe(
          tap(
            (res) => {
              lastRes = res;
              cbs.success?.(res);
            },
            (err) => {
              cbs.fail?.(err);
              cbs.complete?.(err);
            },
            () => cbs.complete?.(lastRes),
          ),
        );
      }
      return stream$;
    });
  }

  /**
   * Promise 入口：普通 API 返回 Promise；task 类同步返回 task；
   * 同步 API 直接返回值。`name` 带补全，也接受任意字符串。
   */
  invoke<N extends MpApiNameInput, T = MpResultOf<N>>(
    name: N,
    options: MpCallbackOptions = {},
  ): MpApiReturn<N, T> {
    if (isTaskApi(name)) {
      return this.invokeTask(name, options) as MpApiReturn<N, T>;
    }
    if (!shouldPromise(name)) {
      return this.callSync(name, options) as MpApiReturn<N, T>;
    }
    return new Promise<T>((resolve, reject) => {
      this.invoke$<N, T>(name, options).subscribe({
        next: (v) => resolve(v),
        error: (e) => reject(e),
      });
    }) as MpApiReturn<N, T>;
  }

  /** 直接取平台原始 API（跳过协议/拦截器），用于协议 custom 之外的特殊场景 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getRawApi(name: MpApiNameInput): ((...args: any[]) => any) | undefined {
    const fn = this.globalObject?.[name];
    return typeof fn === 'function' ? fn : undefined;
  }

  // ---------------------------------------------------------------- 导航

  /**
   * 导航并建立事件通道：url 自动拼 `__id__`，
   * 目标页从 query 取 id 调 `getEventChannel(id)` 消费同一通道。
   */
  navigateTo(options: MpNavigateOptions) {
    const opts: MpCallbackOptions = { ...options };
    const channel = this.initEventChannel(opts.events);
    if (opts.url) {
      opts.url =
        opts.url +
        (String(opts.url).indexOf('?') === -1 ? '?' : '&') +
        '__id__=' +
        channel.id;
    }
    return this.invoke('navigateTo', opts).then((res: any) => {
      if (res && typeof res === 'object') {
        res.eventChannel = channel;
      }
      return res;
    });
  }

  redirectTo(options: MpNavigateOptions) {
    return this.invoke('redirectTo', options);
  }

  switchTab(options: MpNavigateOptions) {
    return this.invoke('switchTab', options);
  }

  reLaunch(options: MpNavigateOptions) {
    return this.invoke('reLaunch', options);
  }

  navigateBack(options: MpNavigateBackOptions = {}) {
    return this.invoke('navigateBack', options);
  }

  preloadPage(options: MpNavigateOptions) {
    return this.invoke('preloadPage', options);
  }

  unPreloadPage(options: MpNavigateOptions) {
    return this.invoke('unPreloadPage', options);
  }

  /** 目标页消费通道（一次性，取后即除） */
  getEventChannel(id: number) {
    const channel = this.eventChannels.get(id);
    this.eventChannels.delete(id);
    return channel;
  }

  private initEventChannel(events?: Record<string, (...args: any[]) => void>) {
    const channel = new MpEventChannel(++this.channelSeq, events);
    this.eventChannels.set(channel.id!, channel);
    return channel;
  }

  // ---------------------------------------------------------------- 交互

  showToast(options: MpToastOptions) {
    return this.invoke('showToast', options);
  }

  hideToast() {
    return this.invoke('hideToast');
  }

  showLoading(options: MpLoadingOptions = {}) {
    return this.invoke('showLoading', options);
  }

  hideLoading() {
    return this.invoke('hideLoading');
  }

  showModal(options: MpCallbackOptions) {
    return this.invoke('showModal', options);
  }

  showActionSheet(options: MpCallbackOptions) {
    return this.invoke('showActionSheet', options);
  }

  // ---------------------------------------------------------------- 存储（异步）

  setStorage(options: MpStorageOptions) {
    return this.invoke('setStorage', options);
  }

  getStorage<T = any>(options: { key: string }): Promise<MpStorageResult<T>> {
    return this.invoke('getStorage', options);
  }

  removeStorage(options: { key: string }) {
    return this.invoke('removeStorage', options);
  }

  clearStorage() {
    return this.invoke('clearStorage');
  }

  // ---------------------------------------------------------------- 存储（同步）

  setStorageSync(key: string, value: unknown) {
    this.callSync('setStorageSync', key, value);
  }

  getStorageSync<T = any>(key: string): T {
    return this.callSync<T>('getStorageSync', key);
  }

  removeStorageSync(key: string) {
    this.callSync('removeStorageSync', key);
  }

  clearStorageSync() {
    this.callSync('clearStorageSync');
  }

  // ---------------------------------------------------------------- 系统

  upx2px(value: number, deviceWidth?: number): number {
    const g = this.globalObject;
    if (typeof g?.upx2px !== 'function') {
      return value;
    }
    // 支付宝收裸数字，微信系收 options 对象
    if (this.platform === 'my') {
      return g.upx2px(value);
    }
    return deviceWidth === undefined
      ? g.upx2px({ number: value })
      : g.upx2px({ number: value, to: 'px', deviceWidth });
  }

  /**
   * 能力探测。不能直接拿统一名去问平台：协议表里改过名的 API
   * （如 setNavigationBarTitle -> setNavigationBar）会被误报为不支持。
   */
  canIUse(schema: string) {
    const protocol = this.protocols[this.platform]?.[schema];
    const targets = protocol?.probe ?? [protocol?.name ?? schema];

    // 平台探测优先：能覆盖组件等非函数能力
    const probe = this.getRawApi('canIUse');
    if (probe) {
      try {
        return targets.every((t) => !!probe.call(this.globalObject, t));
      } catch {
        // 平台探测不可靠，落到存在性判断
      }
    }

    return targets.every((t) => typeof this.getRawApi(t) === 'function');
  }

  // ---------------------------------------------------------------- 系统信息族

  /** 全量增强：原始结果 + 归一字段（device/host/os/safeAreaInsets） */
  getSystemInfoSync() {
    const raw = this.callSync<any>('getSystemInfoSync');
    return enhanceSystemInfo(this.platform, this.globalObject, raw);
  }

  /** 异步全量（走 invoke 管线，可被拦截） */
  getSystemInfo() {
    return this.invoke('getSystemInfo').then((res: any) =>
      enhanceSystemInfo(this.platform, this.globalObject, res),
    );
  }

  /** 平台有原生拆分 API 用原生，否则从 getSystemInfoSync 拼 */
  getDeviceInfo() {
    const source = this.getRawApi('getDeviceInfo')
      ? this.callSync<any>('getDeviceInfo')
      : this.callSync<any>('getSystemInfoSync');
    return buildDeviceInfo(this.platform, this.globalObject, source);
  }

  getAppBaseInfo() {
    const source = this.getRawApi('getAppBaseInfo')
      ? this.callSync<any>('getAppBaseInfo')
      : this.callSync<any>('getSystemInfoSync');
    return buildAppBaseInfo(this.platform, this.globalObject, source);
  }

  getWindowInfo() {
    const source = this.getRawApi('getWindowInfo')
      ? this.callSync<any>('getWindowInfo')
      : this.callSync<any>('getSystemInfoSync');
    return buildWindowInfo(this.platform, this.globalObject, source);
  }

  getMenuButtonBoundingClientRect() {
    return this.callSync('getMenuButtonBoundingClientRect');
  }

  // ================================================================ 域方法
  //
  // 约定：一次性动作 -> Promise；on*/off* 对子 -> Observable（订阅即注册，退订即移除）；
  // 上下文对象 -> MpContext（.on(event) 事件流 + 方法透传）。

  // ---------------------------------------------------------------- 剪贴板

  setClipboardData(options: MpSetClipboardDataOptions) {
    return this.invoke('setClipboardData', options);
  }

  getClipboardData() {
    return this.invoke('getClipboardData');
  }

  // ---------------------------------------------------------------- 电话 / 扫码 / 图片预览

  makePhoneCall(options: MpMakePhoneCallOptions) {
    return this.invoke('makePhoneCall', options);
  }

  scanCode(options: MpScanCodeOptions = {}) {
    return this.invoke('scanCode', options);
  }

  previewImage(options: MpPreviewImageOptions) {
    return this.invoke('previewImage', options);
  }

  closePreviewImage() {
    return this.invoke('closePreviewImage');
  }

  // ---------------------------------------------------------------- 导航栏

  setNavigationBarTitle(options: MpSetNavigationBarTitleOptions) {
    return this.invoke('setNavigationBarTitle', options);
  }

  setNavigationBarColor(
    options: MpSetNavigationBarColorOptions,
  ) {
    return this.invoke('setNavigationBarColor', options);
  }

  showNavigationBarLoading() {
    return this.invoke('showNavigationBarLoading');
  }

  hideNavigationBarLoading() {
    return this.invoke('hideNavigationBarLoading');
  }

  // ---------------------------------------------------------------- TabBar

  showTabBar(options: MpCallbackOptions = {}) {
    return this.invoke('showTabBar', options);
  }

  hideTabBar(options: MpCallbackOptions = {}) {
    return this.invoke('hideTabBar', options);
  }

  setTabBarBadge(options: MpTabBarBadgeOptions) {
    return this.invoke('setTabBarBadge', options);
  }

  removeTabBarBadge(options: MpTabBarIndexOptions) {
    return this.invoke('removeTabBarBadge', options);
  }

  showTabBarRedDot(options: MpTabBarIndexOptions) {
    return this.invoke('showTabBarRedDot', options);
  }

  hideTabBarRedDot(options: MpTabBarIndexOptions) {
    return this.invoke('hideTabBarRedDot', options);
  }

  setTabBarItem(options: MpTabBarItemOptions) {
    return this.invoke('setTabBarItem', options);
  }

  setTabBarStyle(options: MpTabBarStyleOptions) {
    return this.invoke('setTabBarStyle', options);
  }

  // ---------------------------------------------------------------- 页面

  pageScrollTo(options: MpPageScrollToOptions) {
    return this.invoke('pageScrollTo', options);
  }

  startPullDownRefresh() {
    return this.invoke('startPullDownRefresh');
  }

  stopPullDownRefresh() {
    return this.invoke('stopPullDownRefresh');
  }

  loadFontFace(options: MpLoadFontFaceOptions) {
    return this.invoke('loadFontFace', options);
  }

  /** 同步返回平台 animation 对象，配合 `createAnimation().xxx().export()` 使用 */
  createAnimation(config: MpAnimationConfig = {}) {
    return this.callSync<MpAnimation>('createAnimation', config);
  }

  // ---------------------------------------------------------------- 键盘

  showKeyboard(options: MpShowKeyboardOptions = {}) {
    return this.invoke('showKeyboard', options);
  }

  getSelectedTextRange() {
    return this.invoke('getSelectedTextRange');
  }

  // ---------------------------------------------------------------- 媒体

  chooseImage(options: MpChooseImageOptions = {}) {
    return this.invoke('chooseImage', options);
  }

  chooseVideo(options: MpChooseVideoOptions = {}) {
    return this.invoke('chooseVideo', options);
  }

  chooseFile(options: MpChooseFileOptions = {}) {
    return this.invoke('chooseFile', options);
  }

  compressImage(options: MpCompressImageOptions) {
    return this.invoke('compressImage', options);
  }

  compressVideo(options: MpCompressVideoOptions) {
    return this.invoke('compressVideo', options);
  }

  getImageInfo(src: string) {
    return this.invoke('getImageInfo', { src });
  }

  getVideoInfo(options: MpGetVideoInfoOptions) {
    return this.invoke('getVideoInfo', options);
  }

  saveImageToPhotosAlbum(options: MpFilePathOptions) {
    return this.invoke('saveImageToPhotosAlbum', options);
  }

  saveVideoToPhotosAlbum(options: MpFilePathOptions) {
    return this.invoke('saveVideoToPhotosAlbum', options);
  }

  /** 录音管理器：`rec.on('start')` / `rec.on('frameRecorded')` 可订阅 */
  getRecorderManager() {
    return mpContext(this.callSync<any>('getRecorderManager'), (fn) =>
      this.runInAngular(fn),
    );
  }

  // ---------------------------------------------------------------- 文件

  saveFile(options: MpSaveFileOptions) {
    return this.invoke('saveFile', options);
  }

  getFileInfo(options: MpGetFileInfoOptions) {
    return this.invoke('getFileInfo', options);
  }

  getSavedFileInfo(options: MpFilePathOptions) {
    return this.invoke('getSavedFileInfo', options);
  }

  getSavedFileList() {
    return this.invoke('getSavedFileList');
  }

  removeSavedFile(options: MpFilePathOptions) {
    return this.invoke('removeSavedFile', options);
  }

  openDocument(options: MpOpenDocumentOptions) {
    return this.invoke('openDocument', options);
  }

  // ---------------------------------------------------------------- 位置

  getLocation(options: MpGetLocationOptions = {}) {
    return this.invoke('getLocation', options);
  }

  chooseLocation(options: MpChooseLocationOptions = {}) {
    return this.invoke('chooseLocation', options);
  }

  openLocation(options: MpOpenLocationOptions) {
    return this.invoke('openLocation', options);
  }

  startLocationUpdate(
    options: MpStartLocationUpdateOptions = {},
  ) {
    return this.invoke('startLocationUpdate', options);
  }

  stopLocationUpdate() {
    return this.invoke('stopLocationUpdate');
  }

  onLocationChange() {
    return this.event$<MpLocation>('onLocationChange', 'offLocationChange');
  }

  onLocationChangeError() {
    return this.event$<any>(
      'onLocationChangeError',
      'offLocationChangeError',
    );
  }

  // ---------------------------------------------------------------- 设备

  vibrateShort(options: MpCallbackOptions = {}) {
    return this.invoke('vibrateShort', options);
  }

  vibrateLong() {
    return this.invoke('vibrateLong');
  }

  setKeepScreenOn(options: MpSetKeepScreenOnOptions) {
    return this.invoke('setKeepScreenOn', options);
  }

  getScreenBrightness() {
    return this.invoke('getScreenBrightness');
  }

  setScreenBrightness(options: MpSetScreenBrightnessOptions) {
    return this.invoke('setScreenBrightness', options);
  }

  addPhoneContact(options: MpAddPhoneContactOptions) {
    return this.invoke('addPhoneContact', options);
  }

  getAppAuthorizeSetting() {
    return this.callSync<MpAuthorizeSetting>('getAppAuthorizeSetting');
  }

  openAppAuthorizeSetting() {
    return this.invoke('openAppAuthorizeSetting');
  }

  getSystemSetting() {
    return this.callSync<MpSystemSetting>('getSystemSetting');
  }

  // ---------------------------------------------------------------- 传感器

  startAccelerometer(
    options: MpStartAccelerometerOptions = {},
  ) {
    return this.invoke('startAccelerometer', options);
  }

  stopAccelerometer() {
    return this.invoke('stopAccelerometer');
  }

  onAccelerometer() {
    return this.event$<MpAccelerometerReading>(
      'onAccelerometer',
      'offAccelerometer',
    );
  }

  startCompass() {
    return this.invoke('startCompass');
  }

  stopCompass() {
    return this.invoke('stopCompass');
  }

  onCompass() {
    return this.event$<MpCompassReading>('onCompass', 'offCompass');
  }

  startSoterAuthentication(options: MpCallbackOptions) {
    return this.invoke('startSoterAuthentication', options);
  }

  onWindowResize() {
    return this.event$<{ windowWidth: number; windowHeight: number }>(
      'onWindowResize',
      'offWindowResize',
    );
  }

  // ---------------------------------------------------------------- Socket

  /** 返回包装后的 SocketTask：`on('open'|'message'|'error'|'close')` 可订阅 */
  connectSocket(options: MpConnectSocketOptions) {
    return mpContext(this.invoke('connectSocket', options), (fn) =>
      this.runInAngular(fn),
    );
  }

  sendSocketMessage(options: MpSendSocketMessageOptions) {
    return this.invoke('sendSocketMessage', options);
  }

  closeSocket(options: MpCloseSocketOptions = {}) {
    return this.invoke('closeSocket', options);
  }

  // ---------------------------------------------------------------- 登录 / 支付 / 分享 / 插件

  login(options: MpLoginOptions = {}) {
    return this.invoke('login', options);
  }

  getUserInfo(options: MpCallbackOptions = {}) {
    return this.invoke('getUserInfo', options);
  }

  getUserProfile(options: MpCallbackOptions = {}) {
    return this.invoke('getUserProfile', options);
  }

  requestPayment(options: MpPaymentOptions) {
    return this.invoke('requestPayment', options);
  }

  share(options: MpShareOptions) {
    return this.invoke('share', options);
  }

  shareWithSystem(options: MpShareOptions) {
    return this.invoke('shareWithSystem', options);
  }

  getProvider(options: MpGetProviderOptions) {
    return this.invoke('getProvider', options);
  }

  loadSubPackage(options: MpLoadSubPackageOptions) {
    return this.invoke('loadSubPackage', options);
  }

  // ---------------------------------------------------------------- Canvas / Context

  createCanvasContext(canvasId: string) {
    return mpContext(this.callSync<any>('createCanvasContext', canvasId), (fn) =>
      this.runInAngular(fn),
    );
  }

  canvasToTempFilePath(options: MpCanvasToTempFilePathOptions) {
    return this.invoke('canvasToTempFilePath', options);
  }

  canvasGetImageData(
    options: MpCanvasImageDataOptions,
  ) {
    return this.invoke('canvasGetImageData', options);
  }

  canvasPutImageData(options: MpCanvasImageDataOptions) {
    return this.invoke('canvasPutImageData', options);
  }

  createVideoContext(id: string, component?: any) {
    return mpContext(this.callSync<any>('createVideoContext', id, component), (fn) =>
      this.runInAngular(fn),
    );
  }

  createAudioContext(id: string, component?: any) {
    return mpContext(this.callSync<any>('createAudioContext', id, component), (fn) =>
      this.runInAngular(fn),
    );
  }

  createInnerAudioContext(
    options: MpCreateInnerAudioContextOptions = {},
  ) {
    return mpContext(this.callSync<any>('createInnerAudioContext', options), (fn) =>
      this.runInAngular(fn),
    );
  }

  createMapContext(mapId: string, component?: any) {
    return mpContext(this.callSync<any>('createMapContext', mapId, component), (fn) =>
      this.runInAngular(fn),
    );
  }

  createLivePusherContext(id?: string, component?: any) {
    return mpContext(
      this.callSync<any>('createLivePusherContext', id, component),
      (fn) => this.runInAngular(fn),
    );
  }

  getBackgroundAudioManager() {
    return mpContext(this.callSync<any>('getBackgroundAudioManager'), (fn) =>
      this.runInAngular(fn),
    );
  }

  // ---------------------------------------------------------------- 蓝牙 / iBeacon

  openBluetoothAdapter(options: MpCallbackOptions = {}) {
    return this.invoke('openBluetoothAdapter', options);
  }

  startBluetoothDiscovery(options: MpCallbackOptions = {}) {
    return this.invoke('startBluetoothDevicesDiscovery', options);
  }

  stopBluetoothDiscovery() {
    return this.invoke('stopBluetoothDevicesDiscovery');
  }

  getBluetoothDevices() {
    return this.invoke('getBluetoothDevices');
  }

  onBluetoothDeviceFound() {
    return this.event$<{ devices: MpBluetoothDevice[] }>(
      'onBluetoothDeviceFound',
      'offBluetoothDeviceFound',
    );
  }

  createBLEConnection(options: MpBLEDeviceIdOptions) {
    return this.invoke('createBLEConnection', options);
  }

  closeBLEConnection(options: MpBLEDeviceIdOptions) {
    return this.invoke('closeBLEConnection', options);
  }

  onBLEConnectionStateChange() {
    return this.event$<{ deviceId: string; connected: boolean }>(
      'onBLEConnectionStateChange',
      'offBLEConnectionStateChange',
    );
  }

  getBLEDeviceRSSI(options: MpBLEDeviceIdOptions) {
    return this.invoke('getBLEDeviceRSSI', options);
  }

  setBLEMTU(options: MpSetBLEMTUOptions) {
    return this.invoke('setBLEMTU', options);
  }

  getBLEDeviceServices(
    options: MpBLEDeviceIdOptions,
  ) {
    return this.invoke('getBLEDeviceServices', options);
  }

  getBLEDeviceCharacteristics(options: {
    deviceId: string;
    serviceId: string;
  }) {
    return this.invoke('getBLEDeviceCharacteristics', options);
  }

  readBLECharacteristicValue(
    options: MpBLECharacteristicTargetOptions,
  ) {
    return this.invoke('readBLECharacteristicValue', options);
  }

  writeBLECharacteristicValue(
    options: MpBLECharacteristicTargetOptions & { value: ArrayBuffer },
  ) {
    return this.invoke('writeBLECharacteristicValue', options);
  }

  notifyBLECharacteristicValueChange(
    options: MpNotifyBLEChangeOptions,
  ) {
    return this.invoke('notifyBLECharacteristicValueChange', options);
  }

  onBLECharacteristicValueChange() {
    return this.event$<MpBLECharacteristicResult>(
      'onBLECharacteristicValueChange',
      'offBLECharacteristicValueChange',
    );
  }

  startBeaconDiscovery(
    options: MpStartBeaconDiscoveryOptions,
  ) {
    return this.invoke('startBeaconDiscovery', options);
  }

  stopBeaconDiscovery() {
    return this.invoke('stopBeaconDiscovery');
  }

  getBeacons() {
    return this.invoke('getBeacons');
  }

  onBeaconUpdate() {
    return this.event$<{ beacons: MpBeacon[] }>(
      'onBeaconUpdate',
      'offBeaconUpdate',
    );
  }

  onBeaconServiceChange() {
    return this.event$<{ available: boolean; discovering: boolean }>(
      'onBeaconServiceChange',
      'offBeaconServiceChange',
    );
  }

  // ---------------------------------------------------------------- base64

  arrayBufferToBase64(buffer: ArrayBuffer) {
    return this.callSync<string>('arrayBufferToBase64', buffer);
  }

  base64ToArrayBuffer(base64: string) {
    return this.callSync<ArrayBuffer>('base64ToArrayBuffer', base64);
  }

  // ================================================================ 事件桥

  /**
   * 平台 `onXxx` / `offXxx` 对子 -> 冷流：订阅即注册，退订即移除。
   * 平台缺任一侧时静默降级（不抛错），事件不可用时流不发出。
   */
  private event$<T>(onName: MpApiNameInput, offName: MpApiNameInput) {
    return new Observable<T>((subscriber) => {
      const handler = (res: T) => this.runInAngular(() => subscriber.next(res));
      if (this.getRawApi(onName)) {
        this.callSync(onName, handler);
      }
      return () => {
        if (this.getRawApi(offName)) {
          this.callSync(offName, handler);
        }
      };
    });
  }

  // ---------------------------------------------------------------- 内部管线

  private extractCallbacks(options: MpCallbackOptions) {
    const rest = { ...options };
    const success =
      typeof rest.success === 'function' ? rest.success : undefined;
    const fail = typeof rest.fail === 'function' ? rest.fail : undefined;
    const complete =
      typeof rest.complete === 'function' ? rest.complete : undefined;
    delete rest.success;
    delete rest.fail;
    delete rest.complete;
    const cbs =
      success || fail || complete ? { success, fail, complete } : null;
    return { cbs, rest };
  }

  /** 冷流调用单元：订阅时发起，支持 AbortSignal 取消 */
  private callObservable<T>(ctx: MpInvokeContext) {
    return new Observable<T>((subscriber) => {
      const signal = ctx.options.signal as AbortSignal | undefined;
      if (signal?.aborted) {
        subscriber.error(toAbortError(signal));
        return;
      }
      const onAbort = () => subscriber.error(toAbortError(signal));
      signal?.addEventListener?.('abort', onAbort);

      const opts: MpCallbackOptions = { ...ctx.options };
      delete opts.signal;
      opts.success = (res) =>
        this.runInAngular(() => subscriber.next(res));
      opts.fail = (err) => this.runInAngular(() => subscriber.error(err));

      this.dispatch(ctx.name as string, opts);

      return () => signal?.removeEventListener?.('abort', onAbort);
    });
  }

  /**
   * task 类：同步返回 task。
   * pre 管道同步执行（异步 pre 与同步 task 返回物理互斥）；
   * 结果经 post 管道后再触发用户回调；signal 接 task.abort()。
   */
  private invokeTask(name: MpApiNameInput, options: MpCallbackOptions) {
    const { cbs, rest } = this.extractCallbacks(options);
    let ctx: MpInvokeContext = { name, options: rest };
    let emitted = false;
    let preError: any;

    pipeThrough(of(ctx), this.registry.prePipes(name)).subscribe({
      next: (c) => {
        emitted = true;
        ctx = c;
      },
      error: (e) => {
        preError = e;
      },
    });

    if (preError) {
      this.runInAngular(() => {
        cbs?.fail?.(preError);
        cbs?.complete?.(preError);
      });
      return undefined;
    }
    if (!emitted) {
      // 被裸 filter 掉：不发起调用
      return undefined;
    }

    const result$ = new Subject<any>();
    pipeThrough(result$, this.registry.postPipes(name)).subscribe({
      next: (res) => cbs?.success?.(res),
      error: (err) => {
        cbs?.fail?.(err);
        cbs?.complete?.(err);
      },
    });

    const opts: MpCallbackOptions = { ...ctx.options };
    const signal = opts.signal as AbortSignal | undefined;
    delete opts.signal;
    opts.success = (res) =>
      this.runInAngular(() => {
        result$.next(res);
        result$.complete();
        cbs?.complete?.(res);
      });
    opts.fail = (err) =>
      this.runInAngular(() => result$.error(err));

    const task = this.dispatch(name as string, opts);

    if (signal) {
      const abort = () => {
        try {
          (task as any)?.abort?.();
        } catch {
          /* 平台 task 不支持 abort 时忽略 */
        }
      };
      if (signal.aborted) {
        abort();
      } else {
        signal.addEventListener?.('abort', abort);
      }
    }
    return task;
  }

  /** 平台协议归一化后调用目标 API */
  private dispatch(name: string, opts: MpCallbackOptions) {
    const protocol: MpApiProtocol | undefined =
      this.protocols[this.platform]?.[name];

    if (protocol?.custom) {
      return protocol.custom(opts, (targetName, targetArgs) =>
        this.rawCall(targetName, targetArgs, name),
      );
    }

    const normalize = GENERIC_RESULT_NORMALIZERS[this.platform];

    // 结果处理链：平台原始结果 -> 通用归一(errMsg) -> 协议 returnValue -> 下游
    // returnValue 只作用于成功结果；通用归一对 success/fail/complete 都生效
    const wrapResult = (
      handler: ((res: any) => void) | undefined,
      withProtocol: boolean,
    ) => {
      if (!handler) {
        return undefined;
      }
      return (res: any) => {
        let out = normalize ? normalize(name, res) : res;
        if (withProtocol && protocol?.transformResult) {
          out = protocol.transformResult(out);
        }
        if (withProtocol && protocol?.returnValue) {
          out = applyFieldMap(out, protocol.returnValue);
        }
        handler(out);
      };
    };

    const finalOpts: MpCallbackOptions = { ...opts };
    (['success', 'fail', 'complete'] as const).forEach((key) => {
      const wrapped = wrapResult(opts[key], key === 'success');
      if (wrapped) {
        finalOpts[key] = wrapped;
      } else {
        delete finalOpts[key];
      }
    });

    const finalArgs =
      protocol?.args !== undefined
        ? applyFieldMap(finalOpts, protocol.args)
        : finalOpts;
    return this.rawCall(protocol?.name ?? name, finalArgs, name);
  }

  private rawCall(
    targetName: string,
    args: MpCallbackOptions,
    unifiedName: string,
  ): unknown {
    const fn = this.getRawApi(targetName);
    if (!fn) {
      const error = new Error(
        `当前平台(${this.platform})不支持 API: ${unifiedName}${
          targetName !== unifiedName ? `(${targetName})` : ''
        }`,
      );
      // 有回调面时走回调（Promise 模式下即 reject），否则直接抛出
      if (hasCallbackHandlers(args)) {
        args.fail?.(error);
        args.complete?.(error);
        return undefined;
      }
      throw error;
    }
    return fn.call(this.globalObject, args);
  }

  private callSync<T>(name: string, ...args: unknown[]) {
    const fn = this.getRawApi(name);
    if (!fn) {
      throw new Error(`当前平台(${this.platform})不支持 API: ${name}`);
    }
    const result = fn.apply(this.globalObject, args) as any;
    // 同步 API 同样过协议（如支付宝 getStorageSync 的 {data} 拆封）
    const protocol = this.protocols[this.platform]?.[name];
    if (!protocol) {
      return result as T;
    }
    let out = result;
    if (protocol.transformResult) {
      out = protocol.transformResult(out);
    }
    if (protocol.returnValue) {
      out = applyFieldMap(out, protocol.returnValue);
    }
    return out as T;
  }

  private runInAngular(fn: () => void) {
    try {
      fn();
    } finally {
      this.scheduler.notify(NotificationSource.Listener);
    }
  }
}
