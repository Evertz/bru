import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import * as io from 'socket.io-client';
import ansi from 'ansi-html';

import { BehaviorSubject, concat, from, Observable, of } from 'rxjs';
import { map, startWith, take, tap } from 'rxjs/operators';

import {
  FetchedResource, FileSet,
  HostDetails,
  Invocation,
  InvocationDetails,
  StructuredCommandLine,
  TargetMap,
  WorkspaceStatusItems
} from '../../types/invocation-ref';
import { BesEventData, EventType, InvocationStates } from '../../types/events';
import { ConfigService } from './config.service';

@Injectable({ providedIn: 'root' })
export class BruService {
  public static readonly LABEL_URL_PARAM = 'label';
  public static readonly INVOCATION_URL_PARAM = 'invocation';

  private static readonly CONTROL_REG = /.*\[1A.*?\[K/g;

  private readonly io;
  private invocation: Invocation;

  private readonly _invocations$: BehaviorSubject<InvocationStates> = new BehaviorSubject<InvocationStates>({});

  constructor(private readonly http: HttpClient,
              private readonly config: ConfigService) {

    this.io = io.connect(`${this.config.getHost()}:3001/events`);

    this.io.emit(`subscribe/${EventType.INVOCATIONS_EVENT}`, {});

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

    this.io.on(EventType.FILE_SET_EVENT, (data: BesEventData<FileSet>) => {
      this.invocation.ref.fileSets = { ...this.invocation.ref.fileSets, ...data.payload };
      this.invocation.notifyFilesetChanged(this.invocation.ref.fileSets);
    });

    this.io.on(EventType.PROGRESS_EVENT, (data: BesEventData<string>) => {
      const line = data.payload
        .split('\n')
        .map(s => {
          if (s.match(BruService.CONTROL_REG)) {
            s = s.replace(BruService.CONTROL_REG, '').trim();
          }
          return s;
        })
        .map(part => ansi(part));

      line.forEach(l => this.invocation.notifyProgressChange(l));
      this.invocation.ref.progress.push(...line);
    });

    this.io.on(EventType.INVOCATIONS_EVENT, (data: BesEventData<InvocationStates>) => {
      this._invocations$.next(data.payload);
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
    this.io.emit(`subscribe/${EventType.FILE_SET_EVENT}`, { invocationId });

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

  registerForFilesets(invocationId: string): Observable<FileSet> {
    const invocation = this.registerForInvocation(invocationId);
    return invocation.fileSet$
      .pipe(startWith(invocation.ref.fileSets));
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

  registerForInvocations(): Observable<InvocationStates> {
    return this._invocations$.asObservable();
  }

  private get<T>(endpoint: string): Observable<T> {
    return this.http.get<BesEventData<T>>(`http://${this.config.getHost()}:3001/v1/query/${endpoint}`)
      .pipe(map(event => event.payload as T), take(1));
  }

}
