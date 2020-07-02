import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';

import { InvocationLogComponent } from './invocation-log.component';

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
    ScrollingModule,
    MatButtonModule,
  ],
  exports: [],
  declarations: [
    InvocationLogComponent
  ],
  providers: []
})
export class InvocationLogModule {}
