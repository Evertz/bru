import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import * as lodash_ from 'lodash';
import { Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { BesService } from '../../../services/bes.service';
import { Bes2Service } from '../../../services/bes2.service';
import { Target } from '../../../../types/invocation-ref';

const _ = (lodash_ as any).default ? (lodash_ as any).default : lodash_;

@Pipe({
  name: 'targetFilter'
})
export class TargetFilterPipe implements PipeTransform {
  transform(value: Target[], label: string): any {
    if (!value) { return []; }
    if (!label) { return value; }

    return value.filter(t => t.label.indexOf(label.toLowerCase()) > -1);
  }
}

@Component({
  selector: 'bes-target-details',
  templateUrl: './target-details.component.html',
  styleUrls: ['./target-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TargetDetailsComponent implements OnInit {
  targets$: Observable<Target[]>;

  loading = true;

  constructor(private readonly route: ActivatedRoute,
              private readonly router: Router,
              private readonly bes: BesService,
              private readonly bes2: Bes2Service,
              private readonly changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit() {
    const invocation$ = this.route.parent.paramMap.pipe(map(values => values.get(BesService.INVOCATION_URL_PARAM)));

    this.targets$ = invocation$
      .pipe(
        switchMap(invocationId => this.bes2.registerForTargets(invocationId)),
        map(data => Object.values(data)),
        map(targets => {
          return _.sortBy(targets,
            [item => item.testResult, item => item.testResult ? item.testResult.status : undefined, item => item.label]);
        }),
        tap(() => this.loading = false)
      );
  }

  trackBy(index: number, target: Target) {
    return target.label;
  }

  onTargetClick(target: Target) {
    if (!target.testResult) { return; }

    const invocationId = this.route.parent.snapshot.paramMap.get(BesService.INVOCATION_URL_PARAM);

    // this is done via URL so that we can encode the target manually, otherwise the route will encode it twice
    const url = `invocation/${invocationId}/targets/${encodeURIComponent(target.label)}`;
    this.router.navigateByUrl(url);
  }
}
