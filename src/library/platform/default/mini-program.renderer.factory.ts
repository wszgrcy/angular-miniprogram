import {
  Injectable,
  Renderer2,
  RendererFactory2,
  RendererType2,
} from '@angular/core';
import { AgentNode } from './agent-node';
import { MiniProgramRenderer } from './mini-program.renderer';

@Injectable()
export class MiniProgramRendererFactory implements RendererFactory2 {
  defaultRenderer!: MiniProgramRenderer;
  constructor() {}

  createRenderer(element: AgentNode, type: RendererType2 | null): Renderer2 {
    if (!this.defaultRenderer) {
      this.defaultRenderer = new MiniProgramRenderer(element, type);
    }
    return this.defaultRenderer;
  }
  begin() {}
  end() {}
}
