import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { StatusBarComponent } from './status-bar.component';

@NgModule({
  declarations: [StatusBarComponent],
  exports: [StatusBarComponent],
  imports: [
    CommonModule,
    MatProgressBarModule,
    FlexLayoutModule
  ]
})
export class StatusBarModule { }
