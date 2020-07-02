import 'zone.js/dist/zone';

import { platformBrowser } from '@angular/platform-browser';

import { AppModule } from './app.module';

platformBrowser().bootstrapModule(AppModule);
