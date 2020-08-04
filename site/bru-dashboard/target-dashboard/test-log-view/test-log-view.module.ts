import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ConsoleViewModule } from '../../../common/console-view/console-view.module';
import { TestLogViewComponent } from './test-log-view.component';

@NgModule({
  imports: [
    CommonModule,
    ConsoleViewModule
  ],
  declarations: [
    TestLogViewComponent
  ]
})
export class TestLogViewModule {}
