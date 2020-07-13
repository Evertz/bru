import { ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';

import { ConfigService } from '../services/config.service';
import { BruService } from '../services/bru.service';
import { InvocationStates } from '../../types/events';
import { InfoHeaderItems } from '../common/info-header/info-header.component';
import { map, shareReplay } from 'rxjs/operators';
import { SummaryBarItems } from '../common/summary-bar/summary-bar.component';

@Pipe({ name: 'buildResultIcon' })
export class BuildResultIconPipe implements PipeTransform {
  transform(value: string): string {
    switch (value) {
      case 'COMMAND_SUCCEEDED':
        return 'check_circle';
      case 'COMMAND_FAILED':
      case 'USER_ERROR':
      case 'SYSTEM_ERROR':
      case 'RESOURCE_EXHAUSTED':
        return 'error';
      case 'REQUEST_DEADLINE_EXCEEDED':
      case 'INVOCATION_DEADLINE_EXCEEDED':
        return 'timelapse';
      case 'CANCELLED':
        return 'stop';
      case 'UNKNOWN_STATUS':
        return 'help';
      case 'RUNNING':
        return 'circle';
      default:
        return 'help';
    }
  }
}

@Pipe({ name: 'buildResultStyle' })
export class BuildResultStylePipe implements PipeTransform {
  transform(value: string): string {
    switch (value) {
      case 'COMMAND_SUCCEEDED':
        return 'success';
      case 'COMMAND_FAILED':
      case 'USER_ERROR':
      case 'SYSTEM_ERROR':
      case 'RESOURCE_EXHAUSTED':
      case 'REQUEST_DEADLINE_EXCEEDED':
      case 'INVOCATION_DEADLINE_EXCEEDED':
      case 'CANCELLED':
        return 'error';
      case 'UNKNOWN_STATUS':
        return 'unknown';
      case 'RUNNING':
        return 'primary';
      default:
        return 'unknown';
    }
  }
}

@Component({
  selector: 'bru-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  product: string;
  headerItems: InfoHeaderItems = [];
  invocations$: Observable<InvocationStates>;
  summaryItems$: Observable<SummaryBarItems>;

  constructor(private readonly router: Router,
              private readonly bru: BruService,
              private readonly config: ConfigService) {}

  ngOnInit() {
    this.product = this.config.getProductName().full;
    this.invocations$ = this.bru.registerForInvocations()
      .pipe(shareReplay({ refCount: true, bufferSize: 1 }));

    this.summaryItems$ = this.invocations$
      .pipe(
        map(invocations => {
          const stats = Object.values(invocations)
            .reduce(((previousValue, currentValue) => {
              switch (currentValue.state) {
                case 'COMMAND_FAILED':
                case 'USER_ERROR':
                case 'SYSTEM_ERROR':
                case 'RESOURCE_EXHAUSTED':
                case 'REQUEST_DEADLINE_EXCEEDED':
                case 'INVOCATION_DEADLINE_EXCEEDED':
                case 'CANCELLED':
                case 'UNKNOWN_STATUS':
                  previousValue.failed += 1;
                  break;
                case 'RUNNING':
                  previousValue.running += 1;
                  break;
                case 'COMMAND_SUCCEEDED':
                  previousValue.success += 1;
                  break;
              }

              return previousValue;
            }), {
              running: 0,
              failed: 0,
              success: 0
            });

          return [{
            key: 'Running',
            value: stats.running
          },{
            key: 'Success',
            value: stats.success
          },{
            key: 'Failed / Error',
            value: stats.failed
          }];
        })
      );

    this.headerItems.push({
      key: `Bazel ${this.config.getProductName().full}`,
      value: 'Select an invocation to view details'
    });
  }

  onKeypress(event: KeyboardEvent, value: string) {
    if (event.keyCode === ENTER && !!value) {
       this.router.navigate(['/', 'invocation', value]);
    }
  }

  onInvocationClick(invocation: string) {
    this.router.navigate(['/', 'invocation', invocation]);
  }

  invocationTrackBy(index: number, item: { key: string, value: any }) {
    return item.key;
  }

  keywordTrackBy(index: number, item: { key: string, value: any }) {
    return item.key;
  }
}
