import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { combineLatest, Observable } from 'rxjs';
import { filter, map, shareReplay, startWith, switchMap } from 'rxjs/operators';
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
  readonly navLinks = [
    { label: 'Target Details', path: ['.'] },
    //{ label: 'Target Log', path: ['.', 'log'] },
    //{ label: 'Artifacts', path: ['.', 'artifacts'] }
  ];

  routeActivated: boolean;
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
          return [
            { key: 'Kind', value: target.kind },
            { key: 'Start', value: target.testResult.start, transform: 'date' },
            { key: 'Duration', value: `${MomentDurationPipe.transform(target.testResult.duration, 'ms', 's')} (${target.size.toLowerCase()})` },
            { key: 'Run / Attempt', value: `${target.testResult.run} / ${target.testResult.attempt}` },
            { key: 'Status', value: target.testResult.status, transform: 'titlecase' }
          ];
        }),
        startWith([])
      );
  }
}
