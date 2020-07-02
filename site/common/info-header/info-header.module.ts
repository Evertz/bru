import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

import { DashPipeModule } from '../dash-pipe/dash.pipe';
import { InfoHeaderComponent } from './info-header.component';

@NgModule({
  declarations: [
    InfoHeaderComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([]),
    MatIconModule,
    FlexLayoutModule,
    DashPipeModule
  ],
  exports: [
    InfoHeaderComponent
  ]
})
export class InfoHeaderModule { }
