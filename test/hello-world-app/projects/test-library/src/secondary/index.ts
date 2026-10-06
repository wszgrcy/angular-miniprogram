/**
 * 二级出口（`test-library/secondary`）的入口。
 *
 * 存在的意义：验证**多 entry point 的库**在新元数据模型下也正确。
 * 一级出口的组件全在 `fesm2022/test-library.mjs`，二级出口的组件在
 * `fesm2022/test-library-secondary.mjs` —— 两个文件各自带组件，
 * sidecar 里是两个 entry。主构建必须按「组件名」把两边分别对上，
 * 而不是碰一个文件就把整包 emit 一遍。
 */
export * from './secondary-entry.component';
