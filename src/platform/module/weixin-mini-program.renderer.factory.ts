import {
  Injectable,
  Renderer2,
  RendererFactory2,
  RendererType2,
} from '@angular/core';
import { WeixinMiniProgramRenderer } from './weixin-mini-program.renderer';

@Injectable()
export class WeixinMiniProgramRendererFactory implements RendererFactory2 {
  private defaultRenderer!: Renderer2;

  constructor() {
    this.defaultRenderer = new WeixinMiniProgramRenderer();
  }

  createRenderer(element: unknown, type: RendererType2 | null): Renderer2 {
    return this.defaultRenderer;
  }

  begin() {}
  end() {}
}
