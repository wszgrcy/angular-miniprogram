export { miniProgramVitest, type MiniProgramVitestPlugin } from './plugin';
export {
  miniProgramVitestDefine,
  resolveMiniProgramVitestPluginOptions,
  type MiniProgramVitestPluginOptions,
  type ResolvedMiniProgramVitestPluginOptions,
} from './options';
export { MiniProgramPoolWorker } from './pool-worker';
export { MiniProgramVitestSession } from './session';
export {
  DEFAULT_MP_VITEST_PORT,
  MP_VITEST_PROTOCOL_VERSION,
  isMpVitestWireMessage,
  type MpVitestWireMessage,
} from '../protocol';
