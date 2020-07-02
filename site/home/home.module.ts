import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';

import { HomeComponent } from './home.component';

@NgModule({
  imports: [
    CommonModule,
    MatInputModule,
    MatIconModule,
    FlexLayoutModule,
    RouterModule.forChild([])
  ],
  exports: [],
  declarations: [
    HomeComponent
  ],
  providers: []
})
export class HomeModule {}
