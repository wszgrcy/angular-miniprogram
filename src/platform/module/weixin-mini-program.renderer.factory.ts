import {
  Injectable,
  Renderer2,
  RendererFactory2,
  RendererType2,
} from '@angular/core';
import { NoopNode } from './renderer-node';
import { WeixinMiniProgramRenderer } from './weixin-mini-program.renderer';

@Injectable()
export class WeixinMiniProgramRendererFactory implements RendererFactory2 {
  private defaultRenderer!: Renderer2;
  debugIndex = 0;

  constructor() {}

  createRenderer(element: NoopNode, type: RendererType2 | null): Renderer2 {
    console.log('--创建渲染器--', element, type);
    return new WeixinMiniProgramRenderer(element, type, this.debugIndex++);
  }
  begin() {
    console.log('-->开始<---');
  }
  end() {
    console.log('-->结束<---');
  }
}
