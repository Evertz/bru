import { ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ConfigService } from '../services/config.service';

@Component({
  selector: 'bru-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  product: string;

  constructor(private readonly router: Router,
              private readonly config: ConfigService) {}

  ngOnInit() {
    this.product = this.config.getProductName().full;
  }

  onKeypress(event: KeyboardEvent, value: string) {
    if (event.keyCode === ENTER && !!value) {
       this.router.navigate(['/', 'invocation', value]);
    }
  }
}
