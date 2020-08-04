import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { ArtifactsListComponent, HrefPipe } from './artifacts-list.component';

@NgModule({
  imports: [
    CommonModule,
    ScrollingModule,
    MatListModule,
    FlexLayoutModule,
    MatIconModule,
  ],
  declarations: [
    ArtifactsListComponent,
    HrefPipe
  ]
})
export class ArtifactsListModule {}

