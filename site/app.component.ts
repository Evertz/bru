import { DOCUMENT } from '@angular/common';
import { isDevMode, Component, Inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'bru-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isDevMode = isDevMode();

  constructor(private readonly snackbar: MatSnackBar,
              @Inject(DOCUMENT) private readonly doc: Document) { }

  onSupportClick(action: string) {
    // INTERNAL
  }
}
