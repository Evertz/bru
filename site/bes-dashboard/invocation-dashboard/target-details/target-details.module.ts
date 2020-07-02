import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';

import { DurationPipeModule } from '../../../common/duration-pipe/duration.pipe';
import { TargetDetailsComponent, TargetFilterPipe } from './target-details.component';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatListModule,
    MatInputModule,
    MatButtonModule,
    MatDividerModule,
    MatRippleModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterModule.forChild([]),
    ScrollingModule,
    DurationPipeModule
  ],
  exports: [],
  declarations: [
    TargetDetailsComponent,
    TargetFilterPipe
  ],
  providers: []
})
export class TargetDetailsModule {}
