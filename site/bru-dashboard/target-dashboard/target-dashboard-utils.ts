import { ActivatedRoute } from '@angular/router';

import { combineLatest, Observable } from 'rxjs';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';

import { BruService } from '../../services/bru.service';
import { Target } from '../../../types/invocation-ref';

export function extractTarget(route: ActivatedRoute, bru: BruService): Observable<Target> {
  const invocation$ = route.parent.parent.paramMap
    .pipe(map(values => values.get(BruService.INVOCATION_URL_PARAM)));

  const label$ = route.parent.paramMap
    .pipe(map(values => values.get(BruService.LABEL_URL_PARAM)));

  return combineLatest([invocation$, label$])
    .pipe(
      switchMap(([invocation, label]) => {
        return bru.registerForTargets(invocation)
          .pipe(
            filter(targets => targets.hasOwnProperty(label)),
            map(targets => targets[label])
          );
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
}
