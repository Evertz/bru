import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';

import { InvocationDetailsComponent } from './invocation-details.component';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatListModule,
    MatDividerModule,
    MatRippleModule,
    MatIconModule,
    RouterModule.forChild([])
  ],
  exports: [],
  declarations: [
    InvocationDetailsComponent
  ],
  providers: []
})
export class InvocationDetailsModule {}
