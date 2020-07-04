import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { interval, of, Observable } from 'rxjs';
import { map, shareReplay, startWith, switchMap } from 'rxjs/operators';

import * as moment_ from 'moment';
const moment = (moment_ as any).default ? (moment_ as any).default : moment_;

import { OrDashPipe } from '../../common/dash-pipe/dash.pipe';
import { SummaryBarItems } from '../../common/summary-bar/summary-bar.component';
import { BesService } from '../../services/bes.service';
import { InvocationDetails } from '../../../types/invocation-ref';

@Component({
  selector: 'bes-invocation-dashboard',
  templateUrl: './invocation-dashboard.component.html',
  styleUrls: ['./invocation-dashboard.component.scss']
})
export class InvocationDashboardComponent implements OnInit {
  readonly navLinks = [
    { label: 'Targets', path: ['.', 'targets'] },
    { label: 'Invocation Log', path: ['.', 'log'] },
    { label: 'Invocation Details', path: ['.', 'details'] },
    { label: 'Fetched Dependencies', path: ['.', 'fetched'] },
    //{ label: 'Artifacts', path: ['.', 'artifacts'] }
  ];

  metadata$: Observable<SummaryBarItems>;
  duration$: Observable<string>;
  routeActivated: boolean;

  constructor(private readonly route: ActivatedRoute,
              private readonly bes: BesService) {}

  ngOnInit() {
    const data$: Observable<InvocationDetails> = this.route.parent.paramMap
      .pipe(
        map(values => values.get(BesService.INVOCATION_URL_PARAM)),
        switchMap(id => this.bes.registerForInvocationDetails(id)),
        shareReplay({ refCount: true, bufferSize: 1 })
      );

    this.metadata$ = data$
      .pipe(
        map(metadata => {
          let totalTests = metadata.testSummary?.total ?? '0';
          return [
            {
              key: 'Actions created / executed',
              value: `${OrDashPipe.transform((metadata.metrics || {}).actionsCreated)} / ${OrDashPipe.transform((metadata.metrics || {}).actionsExecuted) }`
            },
            {
              key: 'Packages loaded',
              value: metadata.metrics ? metadata.metrics.packagesLoaded : ' - '
            },
            {
              key: 'Successful Tests',
              value: metadata.testSummary ? `${metadata.testSummary.successful}${totalTests !== 0 ? ` / ${totalTests}` : ''}` : '0'
            },
            {
              key: 'Flaky Tests',
              value: metadata.testSummary ? `${metadata.testSummary.flaky}${totalTests !== 0 ? ` / ${totalTests}` : ''}` : '0'
            },
            {
              key: 'Failed Tests',
              value: metadata.testSummary ? `${metadata.testSummary.failed}${totalTests !== 0 ? ` / ${totalTests}` : ''}` : '0'
            }
          ];
        }),
        startWith([])
      );

    this.duration$ = data$
      .pipe(
        switchMap(metadata => {
          const start = parseInt(metadata.startTimeMillis, 10);
          const fin = metadata.finishTimeMillis ? parseInt(metadata.finishTimeMillis, 10) : null;

          return fin ?
            of(this.duration(start, fin)) : interval(1000).pipe(map(() => this.duration(start)));
        })
      );
  }

  private duration(start: number, fin: number = new Date().getTime()): string {
    return moment
      .duration(moment(fin).diff(moment(start)))
      .asSeconds() + ' seconds';
  }
}
