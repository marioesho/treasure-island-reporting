import {
  Directive,
  effect,
  ElementRef,
  input,
  Renderer2
} from '@angular/core';

@Directive({
  selector: '[appAdditionalStyles]'
})
export class AdditionalStylesDirective {
  width = input<string>();

  constructor(private el: ElementRef, private renderer: Renderer2) {
    effect(() => {
      if (!this.width()) return;

      this.renderer.setStyle(this.el.nativeElement, 'width', this.width());
    });
  }

}
