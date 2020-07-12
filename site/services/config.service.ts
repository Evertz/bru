import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConfigService {

  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  getHost() {
    return this.document.location.hostname;
  }

  getProductName() {
    return { full: 'Build Results UI', short: 'BRU' };
  }
}
