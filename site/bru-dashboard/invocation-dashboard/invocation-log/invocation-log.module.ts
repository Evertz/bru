import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { InvocationLogComponent } from './invocation-log.component';
import { ConsoleViewModule } from '../../../common/console-view/console-view.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([]),
    ConsoleViewModule
  ],
  declarations: [
    InvocationLogComponent
  ],
})
export class InvocationLogModule {}
