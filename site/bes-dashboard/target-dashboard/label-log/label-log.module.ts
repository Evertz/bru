import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';

import { LabelLogComponent } from './label-log.component';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatListModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterModule.forChild([]),
    ScrollingModule
  ],
  exports: [],
  declarations: [
    LabelLogComponent
  ],
  providers: []
})
export class LabelLogModule {}
