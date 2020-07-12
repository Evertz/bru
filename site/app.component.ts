import { DOCUMENT } from '@angular/common';
import { isDevMode, Component, Inject, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ConfigService } from './services/config.service';

@Component({
  selector: 'bru-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isDevMode = isDevMode();
  product: string;

  readonly SUPPORT_TYPES = [
    {
      button: 'Report an issue with Bru',
      message: 'Issues can be reported via Github',
      url: 'https://github.com/evertz/bru/issues/new',
      action: 'report issue'
    }
  ];

  constructor(private readonly snackbar: MatSnackBar,
              private readonly config: ConfigService,
              @Inject(DOCUMENT) private readonly doc: Document) { }

  ngOnInit(): void {
    this.product = this.config.getProductName().short;
  }

  onSupportClick(type) {
    this.snackbar.open(type.message, type.action.toUpperCase(), { duration: 4000 })
      .onAction()
      .subscribe(() => this.doc.location.replace(type.url));
  }
}
