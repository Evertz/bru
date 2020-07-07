import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';

import { FetchedListComponent } from './fetched-list.component';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatListModule,
    MatDividerModule,
    MatRippleModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterModule.forChild([]),
    ScrollingModule
  ],
  exports: [],
  declarations: [
    FetchedListComponent
  ],
  providers: []
})
export class FetchedListModule {}
