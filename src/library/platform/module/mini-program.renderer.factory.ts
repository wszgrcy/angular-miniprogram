import {
  Injectable,
  Renderer2,
  RendererFactory2,
  RendererType2,
} from '@angular/core';
import { MiniProgramRenderer } from './mini-program.renderer';
import { AgentNode } from './renderer-node';

@Injectable()
export class MiniProgramRendererFactory implements RendererFactory2 {
  private defaultRenderer!: Renderer2;
  debugIndex = 0;

  constructor() {}

  createRenderer(element: AgentNode, type: RendererType2 | null): Renderer2 {
    // console.log('--创建渲染器--', element, type);
    return new MiniProgramRenderer(element, type, this.debugIndex++);
  }
  begin() {
    // console.log('-->开始<---');
  }
  end() {
    // console.log('-->结束<---');
  }
}
