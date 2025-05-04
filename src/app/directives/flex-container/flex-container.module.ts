import { NgModule } from '@angular/core';

import { FlexContainerDirective } from './flex-container.directive';
import { FlexItemDirective } from './flex-item.directive';

@NgModule({
  imports: [FlexContainerDirective, FlexItemDirective],
  exports: [FlexContainerDirective, FlexItemDirective]
})
export class FlexContainerModule { }
