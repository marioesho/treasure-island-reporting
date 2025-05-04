import {
  Directive,
  effect,
  ElementRef,
  input,
  Renderer2
} from '@angular/core';

import { FlexDirection, FlexSize } from './models';

@Directive({
  selector: '[appFlexContainer]',
})
export class FlexContainerDirective {
  flexDirection = input<FlexDirection>('column');
  flexSize = input<FlexSize>('small');

  private gap: Record<FlexSize, string> = {
    small: '25px',
    large: '50px',
  };

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.renderer.setStyle(this.el.nativeElement, 'display', 'flex');
    this.renderer.setStyle(this.el.nativeElement, 'justify-content', 'flex-start');

    effect(() => {
      this.renderer.setStyle(this.el.nativeElement, 'flex-direction', this.flexDirection());
      if (this.flexDirection() === 'column') {
        this.renderer.setStyle(this.el.nativeElement, 'align-items', 'stretch');
      } else {
        this.renderer.setStyle(this.el.nativeElement, 'align-items', 'center');
      }
    });
    effect(() => {
      this.renderer.setStyle(this.el.nativeElement, 'gap', this.gap[this.flexSize()]);
    });
  }
}
