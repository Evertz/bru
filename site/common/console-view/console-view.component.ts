import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { BehaviorSubject, from, Observable, Subscription } from 'rxjs';
import { debounceTime, filter, map, mergeMap } from 'rxjs/operators';

@Component({
  selector: 'bru-console-view',
  templateUrl: './console-view.component.html',
  styleUrls: ['./console-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConsoleViewComponent implements OnInit, OnDestroy {
  @Input() data$: Observable<string[] | string>;
  @Input() line$: Observable<number>;
  @Input() scrollOnInputChange = true;

  @ViewChild(CdkVirtualScrollViewport, { static: true }) scrollViewport: CdkVirtualScrollViewport;

  dataset$: BehaviorSubject<Array<SafeHtml | string>> = new BehaviorSubject([]);
  fragment: number;
  loading = true;

  private subscriptions: Subscription[] = [];

  constructor(private readonly changeDetectorRef: ChangeDetectorRef,
              private readonly sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    const dataChangeSubscription = this.data$
      .pipe(
        map(data => Array.isArray(data) ? data : [data]),
        mergeMap(datas => from(datas)),
        map(data => this.sanitizer.bypassSecurityTrustHtml(data)),
        map(data => [...this.dataset$.getValue(), data])
      ).subscribe(this.dataset$);

    const scrollSubscription = this.dataset$
      .pipe(
        filter(() => this.scrollOnInputChange),
        debounceTime(200)
      )
      .subscribe(() => this.scrollToIndex(this.scrollViewport.getDataLength() - 1));

    this.subscriptions.push(dataChangeSubscription, scrollSubscription);

    if (this.line$) {
      const scrollFragmentSubscription = this.line$
        .pipe(map(line => line - 1))
        .subscribe(line => {
          if (!!this.fragment) {
            setTimeout(() => this.scrollToIndex(line), 500);
          } else {
            this.scrollToIndex(line);
          }
        });
      this.subscriptions.push(scrollFragmentSubscription);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => {
      if (!(sub && !sub.closed)) {return;}
      sub.unsubscribe();
    });

    this.subscriptions = [];
  }

  private scrollToIndex(index: number) {
    this.fragment = index;
    this.scrollViewport.scrollToIndex(index, 'smooth');
    this.changeDetectorRef.detectChanges();
  }
}
