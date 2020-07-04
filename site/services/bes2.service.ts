import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import * as io from 'socket.io-client';

import { concat, from, Observable, of } from 'rxjs';
import { map, shareReplay, startWith, take, tap } from 'rxjs/operators';

import {
  FetchedResource,
  HostDetails,
  Invocation,
  InvocationDetails,
  StructuredCommandLine,
  TargetMap,
  WorkspaceStatusItems
} from '../../types/invocation-ref';

import * as ansi from 'ansi-html';
import { BesEventData, EventType } from '../../types/events';

@Injectable({ providedIn: 'root' })
export class Bes2Service {
  public static readonly LABEL_URL_PARAM = 'label';
  public static readonly INVOCATION_URL_PARAM = 'invocation';

  private static readonly CONTROL_REG = /.*\[1A.*?\[K/g;

  private readonly io = io.connect('localhost:3001/events');
  private invocation: Invocation;

  constructor(private readonly http: HttpClient) {
    this.io.on(EventType.TARGETS_EVENT, (data: BesEventData<TargetMap>) => {
      this.invocation.ref.targets = { ...this.invocation.ref.targets, ...data.payload };
      this.invocation.notifyTargetsChange(this.invocation.ref.targets);
    });

    this.io.on(EventType.INVOCATION_DETAILS_EVENT, (data: BesEventData<InvocationDetails>) => {
      this.invocation.ref.invocationDetails = data.payload;
      this.invocation.notifyDetailsChange();
    });

    this.io.on(EventType.FETCHED_EVENT, (data: BesEventData<FetchedResource>) => {
      this.invocation.ref.fetched = [...this.invocation.ref.fetched, data.payload];
      this.invocation.notifyFetchedChanged(data.payload);
    });

    this.io.on(EventType.PROGRESS_EVENT, (data: BesEventData<string>) => {
      const line = data.payload
        .split('\n')
        .map(s => {
          if (s.match(Bes2Service.CONTROL_REG)) {
            s = s.replace(Bes2Service.CONTROL_REG, '').trim();
          }
          return s;
        })
        .map(part => ansi(part));

      line.forEach(l => this.invocation.notifyProgressChange(l));
      this.invocation.ref.progress.push(...line);
    });
  }

  registerForInvocation(invocationId: string): Invocation {
    if (this.invocation && this.invocation.ref.streamId.invocationId === invocationId) {
      return this.invocation;
    }

    if (this.invocation) {
      const previousInvocation = this.invocation.ref.streamId.invocationId;
      if (previousInvocation) {
        // unsub?
      }

      this.invocation.init(invocationId);
    } else {
      this.invocation = Invocation.init(invocationId);
    }

    this.io.emit(`subscribe/${EventType.INVOCATION_DETAILS_EVENT}`, { invocationId });
    this.io.emit(`subscribe/${EventType.TARGETS_EVENT}`, { invocationId });
    this.io.emit(`subscribe/${EventType.PROGRESS_EVENT}`, { invocationId });
    this.io.emit(`subscribe/${EventType.FETCHED_EVENT}`, { invocationId });

    return this.invocation;
  }

  registerForFetchedResources(invocationId: string): Observable<FetchedResource[]> {
    return this.registerForInvocation(invocationId)
      .fetched$
      .pipe(
        map(_ => this.invocation.ref.fetched),
        startWith(this.invocation.ref.fetched)
      );
  }

  registerForTargets(invocationId: string): Observable<TargetMap> {
    return this.registerForInvocation(invocationId)
      .targets$
      .pipe(startWith(this.invocation.ref.targets));
  }

  registerForInvocationDetails(invocationId: string): Observable<InvocationDetails> {
    return this.registerForInvocation(invocationId)
      .details$
      .pipe(startWith(this.invocation.ref.invocationDetails));
  }

  registerForProgress(invocationId: string): Observable<string> {
    const invocation = this.registerForInvocation(invocationId);
    return concat(
      from(invocation.ref.progress),
      invocation.progress$
    );
  }

  getStructuredCommandLine(invocationId: string): Observable<StructuredCommandLine> {
    const invocation = this.registerForInvocation(invocationId);
    if (invocation.ref.canonicalStructuredCommandLine) {
      return of(invocation.ref.canonicalStructuredCommandLine);
    }

    return this.get<StructuredCommandLine>(`${invocationId}/commandline`)
      .pipe(
        tap(commandLine => invocation.ref.canonicalStructuredCommandLine = commandLine),
        tap(_ => invocation.notifyCanonicalStructuredCommandLineChange()),
      );
  }

  getWorkspaceStatus(invocationId: string): Observable<WorkspaceStatusItems> {
    const invocation = this.registerForInvocation(invocationId);
    if (invocation.ref.workspaceStatus) {
      return of(invocation.ref.workspaceStatus);
    }

    return this.get<WorkspaceStatusItems>(`${invocationId}/workspacestatus`)
      .pipe(
        tap(commandLine => invocation.ref.workspaceStatus = commandLine),
        tap(_ => invocation.notifyWorkspaceStatusChange()),
      );
  }

  getHostDetails(invocationId: string): Observable<HostDetails> {
    const invocation = this.registerForInvocation(invocationId);
    if (invocation.ref.hostDetails) {
      return of(invocation.ref.hostDetails);
    }

    return this.get<HostDetails>(`${invocationId}/hostdetails`)
      .pipe(
        tap(hostDetails => invocation.ref.hostDetails = hostDetails),
        tap(_ => invocation.notifyHostDetailsChange()),
      );
  }

  private get<T>(endpoint: string): Observable<T> {
    return this.http.get<BesEventData<T>>(`http://localhost:3001/v1/query/${endpoint}`)
      .pipe(map(event => event.payload as T), take(1));
  }

}
