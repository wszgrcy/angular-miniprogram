import 'miniprogram-api-typings';
export const MiniProgramCore = {
  loadApp<T>(app: T) {
    App(app || {});
    const appInstance = getApp();
    return appInstance;
  },
  MINIPROGRAM_GLOBAL: wx,
};
