import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';

import { SummaryBarModule } from '../../common/summary-bar/summary-bar.module';
import { TargetDashboardComponent } from './target-dashboard.component';

@NgModule({
  imports: [
    CommonModule,
    MatInputModule,
    MatIconModule,
    MatTabsModule,
    MatListModule,
    FlexLayoutModule,
    RouterModule.forChild([]),
    SummaryBarModule
  ],
  exports: [],
  declarations: [
    TargetDashboardComponent
  ],
  providers: []
})
export class TargetDashboardModule {}
