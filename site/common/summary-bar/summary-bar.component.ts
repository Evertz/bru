import {
  ChangeDetectionStrategy,
  Component, Directive,
  Input,
  Pipe,
  PipeTransform
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { isObservable, of, Observable } from 'rxjs';

export interface SummaryBarItem<T extends any> {
  key: string;
  value: T | Observable<T> | Promise<T>;
  transform?: string;
  icon?: string;
  link?: string[];
  canCopy?: boolean;
}

export type SummaryBarItems = Array<SummaryBarItem<any>>;

@Pipe({ name: 'valueAsAsyncValue' })
export class ValueAsAsyncPipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    if (value === undefined || value === null) { return value; }
    if (isObservable(value) || typeof value.then === 'function') { return value; }
    return of(value);
  }
}

@Directive({ selector: 'besSummaryTitle' })
export class SummaryItemTitleDirective { }

@Directive({ selector: 'besSummaryValue' })
export class SummaryItemValueDirective { }

@Component({
  selector: 'bes-summary-item',
  template: `
    <div class="bes-summary-item" fxLayout="column" fxLayoutAlign="center" fxFlex="1 1">
      <span class="bes-subtitle">
        <ng-content select="[besSummaryTitle]"></ng-content>
      </span>
      <div fxLayout="row" fxLayoutAlign="start center" fxLayoutGap="6px">
        <span class="bes-summary-item-value">
          <ng-content select="[besSummaryValue]"></ng-content>
        </span>
      </div>
    </div>
  `,
  styleUrls: ['./summary-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummaryItemComponent {}

@Component({
  selector: 'bes-summary-bar',
  templateUrl: './summary-bar.component.html',
  styleUrls: ['./summary-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummaryBarComponent {
  @Input() items: SummaryBarItems = [];

  constructor(private readonly snackbar: MatSnackBar) {}

  _itemTrackBy(index: number, item: SummaryBarItem<any>) {
    return item.key;
  }

  onCopyClick(target: string) {
    let tmpInput: HTMLTextAreaElement;
    try {
      tmpInput = document.createElement('textarea');
      tmpInput.innerHTML = target;
      document.body.appendChild(tmpInput);
      tmpInput.select();
      document.execCommand('copy');

      this.snackbar.open('Copied label to clipboard', 'CLOSE', { duration: 3000 });
    } catch (e) {
    } finally {
      if (tmpInput) {
        document.body.removeChild(tmpInput);
      }
    }
  }
}
