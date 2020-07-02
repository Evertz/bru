import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { combineLatest, from, Observable } from 'rxjs';
import { filter, map, startWith, switchMap } from 'rxjs/operators';
import { MomentDurationPipe } from '../../common/duration-pipe/duration.pipe';

import { SummaryBarItems } from '../../common/summary-bar/summary-bar.component';
import { BesService } from '../../services/bes.service';

@Component({
  selector: 'bes-target-dashboard',
  templateUrl: './target-dashboard.component.html',
  styleUrls: ['./target-dashboard.component.scss']
})
export class TargetDashboardComponent implements OnInit {
  readonly navLinks = [
    { label: 'Target Details', path: ['.', 'details'] },
    { label: 'Target Log', path: ['.', 'log'] },
    { label: 'Artifacts', path: ['.', 'artifacts'] }
  ];

  routeActivated: boolean;
  metadata$: Observable<SummaryBarItems>;

  constructor(private readonly route: ActivatedRoute,
              private readonly bes: BesService) {}

  ngOnInit() {
    const invocation$ = this.route.parent.paramMap.pipe(map(values => values.get(BesService.INVOCATION_URL_PARAM)));
    const label$ = this.route.paramMap.pipe(
      map(values => values.get(BesService.LABEL_URL_PARAM))
    );

    this.metadata$ = combineLatest(invocation$, label$)
      .pipe(
        switchMap(([invocation, label]) => {
          return this.bes.getBuildTargets(invocation)
            .pipe(
              switchMap((data: Array<{ label: string }>) => from(data)),
              filter(targets => targets.label === label)
            );
        }),
        map((target: any) => {
          return [
            { key: 'Label', value: target.label, canCopy: true },
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
