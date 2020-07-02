import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { combineLatest, merge, Observable, Subject, Subscription } from 'rxjs';
import { filter, finalize, map, switchMap, tap } from 'rxjs/operators';

import { BesService } from '../../../services/bes.service';

@Component({
  selector: 'bes-label-log',
  templateUrl: './label-log.component.html',
  styleUrls: ['./label-log.component.scss']
})
export class LabelLogComponent implements OnInit, OnDestroy {
  private static readonly ANCHOR_START_TAG = 'line-';

  log$: Observable<string[]>;

  @ViewChild(CdkVirtualScrollViewport, { static: true }) scrollViewport: CdkVirtualScrollViewport;

  private viewportScroll: Subject<string> = new Subject<string>();
  private viewportScrollSub: Subscription;

  loading = true;
  fragment: number;

  constructor(private readonly route: ActivatedRoute,
              private readonly bes: BesService,
              private readonly changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit() {
    const invocation$ = this.route.parent.parent.paramMap
      .pipe(map(values => values.get(BesService.INVOCATION_URL_PARAM)));

    const label$ = this.route.parent.paramMap.pipe(
      map(values => values.get(BesService.LABEL_URL_PARAM)),
      map(value => value.replace('+', '/'))
    );

    this.log$ = combineLatest(invocation$, label$)
      .pipe(
        tap(() => {
          this.loading = true;
          this.changeDetectorRef.detectChanges();
        }),
        switchMap(([invocationId, label]) => this.bes.getTestlogsForLabel(invocationId, label).pipe(
          finalize(() => {
            this.loading = false;
            this.changeDetectorRef.detectChanges();
          })
        )),
        map(data => {
          const lines = data.content.split('\n');
          lines.splice(0, 1);
          return lines;
        }),
        tap(() => {
          // SIDE EFFECT
          // if we have a scroll offset but now have the data, scroll to that offset on the next VM turn
          const fragment = this.route.snapshot.fragment;
          if (!!fragment && fragment.startsWith(LabelLogComponent.ANCHOR_START_TAG)) {
            setTimeout(() => this.viewportScroll.next(fragment));
          }
        })
      );

    this.viewportScrollSub = merge(this.route.fragment, this.viewportScroll)
      .pipe(
        filter(fragment => !!fragment && !!this.scrollViewport),
        map(fragment => fragment.split(LabelLogComponent.ANCHOR_START_TAG)[1]),
        filter(index => !!index),
        map(index => parseInt(index, 10) - 1),
        filter(index => index >= 0)
      )
      .subscribe(index => this.scrollToIndex(index));
  }

  ngOnDestroy(): void {
    this.viewportScroll.complete();
    this.viewportScrollSub.unsubscribe();
  }

  private scrollToIndex(index: number) {
    this.scrollViewport.scrollToIndex(index, 'smooth');
    this.fragment = index;
  }

}
