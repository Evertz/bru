import { CommonModule } from '@angular/common';
import { NgModule, Pipe, PipeTransform } from '@angular/core';

import * as moment_ from 'moment';
const moment = (moment_ as any).default ? (moment_ as any).default : moment_;

@Pipe({
  name: 'duration'
})
export class MomentDurationPipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    return MomentDurationPipe.transform(value, ...args);
  }

  static transform(value: any, ...args): string {
    return moment.duration(parseInt(value, 10), args[0]).as(args[1]) + `${args[1]}`;
  }
}

@Pipe({
  name: 'humanduration'
})
export class HumanMomentDurationPipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    return moment.duration(parseInt(value, 10), args[0]).humanize(true);
  }
}

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    MomentDurationPipe,
    HumanMomentDurationPipe
  ],
  declarations: [
    MomentDurationPipe,
    HumanMomentDurationPipe
  ]
})
export class DurationPipeModule {}
