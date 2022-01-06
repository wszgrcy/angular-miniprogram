## Service

- `ComponentFinderService`: get MiniProgram Component corresponding to Angular Component

## token

- `APP_TOKEN`: get App instance
- `PAGE_TOKEN`: get MiniProgram Page corresponding to Angular Component

## api

- `pageStartup`: page entry
- `componentRegistry`: component registry

## Static property on @Component

- `static mpPageOptions`: like `Page(mpPageOptions)`
  > use when Component as a Page
- `static mpComponentOptions`: like `Component(mpComponentOptions)`
  > use when Component as a Component or a Page but `pageStartup` with `{useComponent:true}`

## Global Variable

- `miniProgramPlatform`: string, hint miniprogram platform(`wx`,`zfb`,`zj`,`bdzn`,`qq`,`dd`,etc)
