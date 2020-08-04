import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { combineLatest, Observable } from 'rxjs';
import { filter, map, shareReplay, startWith, switchMap, take } from 'rxjs/operators';
import { MomentDurationPipe } from '../../common/duration-pipe/duration.pipe';

import { SummaryBarItems } from '../../common/summary-bar/summary-bar.component';
import { BruService } from '../../services/bru.service';
import { Target } from '../../../types/invocation-ref';

@Component({
  selector: 'bru-target-dashboard',
  templateUrl: './target-dashboard.component.html',
  styleUrls: ['./target-dashboard.component.scss']
})
export class TargetDashboardComponent implements OnInit {
  routeActivated: boolean;

  navLinks$: Observable<any[]>;
  target$: Observable<Target>;
  metadata$: Observable<SummaryBarItems>;

  constructor(private readonly route: ActivatedRoute,
              private readonly bru: BruService) {}

  ngOnInit() {
    const invocation$ = this.route.parent.paramMap.pipe(map(values => values.get(BruService.INVOCATION_URL_PARAM)));
    const label$ = this.route.paramMap.pipe(map(values => values.get(BruService.LABEL_URL_PARAM)));

    this.target$ = combineLatest([invocation$, label$])
      .pipe(
        switchMap(([invocation, label]) => {
          return this.bru.registerForTargets(invocation)
            .pipe(
              filter(targets => targets.hasOwnProperty(label)),
              map(targets => targets[label])
            );
        }),
        shareReplay({ refCount: true, bufferSize: 1 })
      );

    this.metadata$ = this.target$
      .pipe(
        map((target: Target) => {
          const meta: SummaryBarItems = [
            { key: 'Kind', value: target.kind },
            { key: 'State', value: target.state, transform: 'titlecase' },
          ];

          if (target.testResult) {
            meta.push(
              { key: 'Start', value: target.testResult.start, transform: 'date' },
              { key: 'Duration', value: `${MomentDurationPipe.transform(target.testResult.duration, 'ms', 's')} (${target.size.toLowerCase()})` },
              { key: 'Run / Attempt', value: `${target.testResult.run} / ${target.testResult.attempt}` },
              { key: 'Status', value: target.testResult.status, transform: 'titlecase' }
            );
          }

          return meta;
        }),
        startWith([])
      );

    this.navLinks$ = this.target$
      .pipe(
        map(target => {
          const links = [{ label: 'Target Details', path: ['.'] }];

          if (target.testResult) {
            links.push(
              { label: 'Test Results', path: ['.', 'results'] },
              { label: 'Test Log', path: ['.', 'log'] },
            )
          }

          links.push({ label: 'Artifacts', path: ['.', 'artifacts'] });

          return links;
        }),
        take(1)
      )
  }
}
