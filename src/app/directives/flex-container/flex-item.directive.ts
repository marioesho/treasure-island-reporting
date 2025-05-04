import {
  Directive,
  effect,
  ElementRef,
  input,
  Renderer2
} from '@angular/core';

@Directive({
  selector: '[appFlexItem]'
})
export class FlexItemDirective {
  grow = input<string>('0');
  shrink = input<string>('1');
  basis = input<string>('auto');

  constructor(private el: ElementRef, private renderer: Renderer2) {
    effect(() => {
      this.renderer.setStyle(this.el.nativeElement, 'flex', `${this.grow()} ${this.shrink()} ${this.basis()}`);
    });
  }
}
