import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { from, of, EMPTY, Observable } from 'rxjs';
import {
  catchError,
  filter,
  flatMap,
  map, share,
  shareReplay,
  startWith,
  switchMap,
  tap,
  toArray
} from 'rxjs/operators';
import { WebSocketSubject } from 'rxjs/webSocket';

export interface BuildToolMetadata {
  uuid: string;
  state: 'running' | 'success' | 'failed';
  buildToolVersion: string;
  command: string;
  startTimeMillis: string;
  finishTimeMillis: string;
  workspaceDirectory: string;
  overallSuccess: boolean;
  targetMetrics?: {
    targetsLoaded?: string;
    targetsConfigured?: string;
  };
  actionSummary?: {
    actionsExecuted?: string;
    actionsCreated?: string;
  };
  packageMetrics?: {
    packagesLoaded?: string;
  };
  exitCode?: string;
  pattern: string[];
  successfulTests?: number;
  failedTests?: number;
  flakyTests?: number;
}

export type BuildToolLog = string[];

export interface BuildTarget {
  kind: string;
  label: string;
  state: string;
  success: string;
  importantOutput: Array<{ name: string, pathPrefix: string[], uri: string }>;
  size?: string;
  testSummary?: any;
  testResult?: {
    attempt: number;
    duration: string;
    run: number;
    start: string;
    status: string;
    strategy: string;
  };
}

export type BuildTargets = BuildTarget[];

export interface BuildInvocationDetails {
  canonical: BuildToolArgs;
  original: BuildToolArgs;
  mnemonic: string;
  cpu: string;
  fetched: string[];
  makeVariable?: { [key: string]: string };
}

export interface BuildToolArgs {
  command: string;
  commandArgs: string[];
  exe: string;
  residual: string[];
  startupArgs: string[];
}

export interface BuildContext {
  build_number?: number;
  build_tag?: string;
  build_url?: string;
  build_user_email?: string;
  build_user?: string;
  ci: boolean;
  user: string;
  host: string;
  git_sha: string;
  git_branch: string;
}

export class BesInvocation {
  private readonly cache: Map<string, any> = new Map();
  private readonly store = (key: string) => tap(value => this.cache.set(key, value));
  private readonly retrieve = (key: string, valueOnMissing?: any) =>
    startWith(this.cache.has(key) ? this.cache.get(key) : valueOnMissing)

  private watchInvocationItem<T>(key: string, fetcher: (invocationId: string) => Observable<T>, valueOnMissing?: T): Observable<T> {
    return this.invocationChange$
      .pipe(
        startWith(this.invocationId),
        switchMap(id => fetcher(id).pipe(this.store(key))),
        this.retrieve(key, valueOnMissing),
        filter(data => !!data),
        shareReplay(1)
      );
  }

  constructor(private readonly bes: BesService,
              private readonly invocationId: string,
              private readonly invocationChange$: Observable<string>) {}

  metadata$ = this.watchInvocationItem<BuildToolMetadata>('metadata',
    () => this.bes.getInvocationItem(this.invocationId, 'metadata', true));

  log$ = this.watchInvocationItem<BuildToolLog>('log',
    () => this.bes.getInvocationLog(this.invocationId, true), []);

  targets$ = this.watchInvocationItem<BuildTargets>('targets',
    () => this.bes.getInvocationItem(this.invocationId, 'targets', true), []);
}

@Injectable()
export class BesService {
  private static readonly SOCK_URI = 'wss://vptl2v7345.execute-api.us-east-1.amazonaws.com/prod/';
  public static readonly INVOCATION_URL_PARAM = 'invocation';
  public static readonly LABEL_URL_PARAM = 'label';
  private static readonly API_BASE = `bazel-bes.evertz.tools/data`;

  private readonly baseUrl = `https://${BesService.API_BASE}`;
  private readonly socket$: WebSocketSubject<any>;
  private readonly cache: Map<string, Map<string, any>> = new Map();
  private readonly testlogs: Map<string, any> = new Map();
  private readonly registrations: Map<string, BesInvocation> = new Map();

  constructor(private readonly snackbar: MatSnackBar) {
    this.socket$ = new WebSocketSubject(BesService.SOCK_URI);
    this.socket$.subscribe(data => console.log(data));
  }

  registerInvocation(invocationId: string): BesInvocation {
    return null;
    //if (this.registrations.has(invocationId)) { return this.registrations.get(invocationId); }
    //
    //const registration$ = this.socket$.multiplex(
    //  () => ({ _type: 'register', invocationId }), () => ({ _type: 'unregister', invocationId }), message => true)
    //  .pipe(map(message => message.invocationId));
    //
    //const invocation = new BesInvocation(this, invocationId, registration$.pipe(share()));
    //this.registrations.set(invocationId, invocation);
    //
    //return invocation;
  }

  getRawBuildEvents(invocationId: string): Observable<any> {
    //return this.http.get<any[]>(`${this.baseUrl}/${invocationId}/events.json`);
    return EMPTY;
  }

  getBuildMetadata(invocationId: string): Observable<BuildToolMetadata> {
    return this.getInvocationItem<BuildToolMetadata>(invocationId, 'metadata');
  }

  getBuildContext(invocationId: string): Observable<BuildContext> {
    return this.getInvocationItem<BuildContext>(invocationId, 'context');
  }

  getBuildTargets(invocationId: string): Observable<BuildTargets> {
    return this.getInvocationItem<BuildTargets>(invocationId, 'targets');
  }

  getInvocationLog(invocationId: string, forceFetch = false): Observable<BuildToolLog> {
    return this.getInvocationItem<BuildToolLog>(invocationId, 'log', forceFetch)
      .pipe(
        switchMap(group => from(group)),
        flatMap(lines => lines.split('\n')),
        toArray()
      );
  }

  getInvocationDetails(invocationId: string): Observable<BuildInvocationDetails> {
    return this.getInvocationItem<BuildInvocationDetails>(invocationId, 'details');
  }

  getTestlogsForLabel(invocationId: string, label: string): Observable<any> {
    // labels start with a double /, strip it
    const resolvedLabel = label.substring(2, label.length).replace(':', '/');
    const key = `${ invocationId }/testlogs/${ resolvedLabel }/test.log`;

    if (this.testlogs.has(key)) {
      return of(this.testlogs.get(key));
    }

    return EMPTY;

    //return this.http.get(`${ this.baseUrl }/${ key }`)
    //  .pipe(
    //    tap(data => {
    //      this.testlogs.set(key, data);
    //    }),
    //    catchError(err => {
    //      this.snackbar.open(`Failed to get test logs for invocation '${ invocationId }', see log for details`, 'CLOSE');
    //      console.error(err);
    //      return EMPTY;
    //    })
    //  );
  }

  getInvocationItem<T>(invocationId: string, item: string, forceFetch = false): Observable<T> {
    if (!forceFetch && this.cache.has(invocationId) && this.cache.get(invocationId).has(item)) {
      return of(this.cache.get(invocationId).get(item));
    }
    return EMPTY;
    //return this.http.get<T>(`${this.baseUrl}/${invocationId}/${item}.json`)
    //  .pipe(
    //    tap(data => {
    //      if (!this.cache.has(invocationId)) { this.cache.set(invocationId, new Map()); }
    //      this.cache.get(invocationId).set(item, data);
    //    }),
    //    catchError(err => {
    //      this.snackbar.open(`Failed to get ${item} for invocation '${invocationId}', see log for details`, 'CLOSE');
    //      console.error(err);
    //      return EMPTY;
    //    })
    //  );
  }

}
