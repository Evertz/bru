import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';

import { ConsoleViewComponent } from './console-view.component';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatListModule,
    MatProgressSpinnerModule,
    RouterModule.forChild([]),
    ScrollingModule,
  ],
  declarations: [
    ConsoleViewComponent
  ],
  exports: [
    ConsoleViewComponent
  ]
})
export class ConsoleViewModule {}
