import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';

import { DashPipeModule } from '../dash-pipe/dash.pipe';
import {
  SummaryBarComponent,
  SummaryItemComponent,
  SummaryItemTitleDirective,
  SummaryItemValueDirective,
  ValueAsAsyncPipe
} from './summary-bar.component';

@NgModule({
  declarations: [
    SummaryBarComponent,
    ValueAsAsyncPipe,
    SummaryItemComponent,
    SummaryItemTitleDirective,
    SummaryItemValueDirective
  ],
  exports: [
    SummaryBarComponent,
    SummaryItemComponent,
    SummaryItemTitleDirective,
    SummaryItemValueDirective
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    DashPipeModule,
    RouterModule.forChild([])
  ]
})
export class SummaryBarModule { }
