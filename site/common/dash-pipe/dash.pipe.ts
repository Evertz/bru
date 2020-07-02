import { CommonModule } from '@angular/common';
import { NgModule, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dash'
})
export class OrDashPipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    return OrDashPipe.transform(value);
  }

  static transform(value?: any): string {
    if (value === undefined || value === null) { return ' - '; }
    return value.toString();
  }
}

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    OrDashPipe
  ],
  declarations: [
    OrDashPipe
  ]
})
export class DashPipeModule {}
