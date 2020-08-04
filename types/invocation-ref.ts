import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { BesEvent, BesEventFactory, EventType } from './events';

/**
 * Details for an output file that will be present in the CAS, which can be fetched from Bru
 */
export interface OutputFile {
  /**
   * The name of the file
   */
  name: string;

  /**
   * The files location in the CAS
   */
  location: string;

  /**
   * The files source prefix on disk
   */
  prefix?: string[];
}

/**
 * Details for tracking a named set of files
 */
export interface FileSet {
  /**
   * Mapping the file set id to a list of output files
   */
  [id: string]: {
    /**
     * Files that are part of this set
     */
    files?: OutputFile[];

    /**
     * Other referenced file sets
     */
    refs?: string[];
  }
}


/**
 * Details about the invocation
 */
export interface InvocationDetails {
  /**
   * The time the invocation started
   */
  startTimeMillis?: string;

  /**
   * The time the invocation ended
   */
  finishTimeMillis?: string;

  /**
   * Version string associated with the build tool
   */
  buildToolVersion?: string;

  /**
   * The command that the tool was called with
   */
  command?: string;

  /**
   * The pattern that was expanded for this invocation
   */
  pattern?: string[];

  /**
   * The workspace directory of the build
   */
  workspaceDirectory?: string;

  /**
   * The invocations exit code
   */
  exitCode?: {
    /**
     * The name for this exit code
     */
    name: string;

    /**
     * The numeric code itself
     */
    code: number;
  };

  /**
   * Summary of the tests done for this invocation
   */
  testSummary?: {
    /**
     * The number of successful tests run
     */
    successful: number;

    /**
     * The number of flaky tests run
     */
    flaky: number;

    /**
     * The number of failed tests run
     */
    failed: number;

    /**
     * Total number of tests
     */
    total: number;
  }

  /**
   * Build metrics summary
   */
  metrics: {
    /**
     * Number of actions executed as part of this build
     */
    actionsExecuted: number;

    /**
     * Number of actions created
     */
    actionsCreated?: number;

    /**
     * Number of packages loaded (BUILD files)
     */
    packagesLoaded?: number;
  }

  /**
   * Custom metadata for this invocation
   */
  metadata?: { [key: string]: string };

  /**
   * A map of make variables from the invocation
   */
  makeVariables?: { [key: string]: string };
}

/**
 * Details about the host running the invocation (normally a CI worker or a local dev machine)
 */
export interface HostDetails {
  /**
   * Explicit variable set when this is an invocation run on a CI worker
   */
  THIS_IS_CI?: boolean;

  /**
   * key / value environment variables
   */
  env?: { [key: string]: string };

  /**
   * The name of the CPU from this configuration
   */
  cpu?: string;

  /**
   * The name of the platform from this configuration
   */
  platformName?: string;
}

export interface Target {
  /**
   * The label representing this target
   */
  label: string;

  /**
   * The state of this target, completed, configured etc
   */
  state: string;

  /**
   * The rule kind of the target
   */
  kind?: string;

  /**
   * If this target was build or run successfully
   */
  success?: boolean;

  /**
   * If this is a test target, then this represents the test size
   */
  size?: string;

  /**
   * ????
   */
  testSummary?: any;

  /**
   * The tags that belong to this target, if any
   */
  tags?: string[];

  /**
   * If this targets state is aborted, this field is populated with the reason for the abort
   */
  abortDescription?: string;

  /**
   * A summary of the test details, if this target was a test
   */
  testResult?: {
    /**
     * Attempt count for this target
     */
    attempt: string;

    /**
     * Number of ms this test target took to run
     */
    duration: number;

    /**
     * The run number of this test target
     */
    run: number;

    /**
     * When this test started
     */
    start: number;

    /**
     * The status of this test
     */
    status: string;

    /**
     * The build strategy used for this target
     */
    strategy: string;

    /**
     * If this result was pulled from a cache (local or remote)
     */
    cached: boolean;

    /**
     * The log file for this test invocation
     */
    log?: OutputFile;

    /**
     * The test.xml report for this file
     */
    report?: OutputFile;
  };

  /**
   * Outputs of this target associated with a particular output group
   */
  outputs?: FileSet;
}

/**
 * A map of label to target
 */
export type TargetMap = { [key: string]: Target };

/**
 * A list of workspace key / value pairs
 */
export type WorkspaceStatusItems = Array<{ key: string, value: string }>;

/**
 * A fetched external resource that happened during this invocation stream
 */
export type FetchedResource = { url: string, success: boolean };

export interface StructuredCommandLine {
  /**
   * Data for each of the parsed command line sections
   */
  sections?: {
    executable: string[];
    residual: string[];
    command: string[];
    startupArgs: Array<{ optionName: string, optionValue: string }>;
    commandArgs: Array<{ optionName: string, optionValue: string }>;
  }
}

/**
 * A reference to an invocation, representing processed data in a 'easy to digest' form for a UI client
 */
export interface InvocationRef {
  /**
   * Unique identifier for a build event stream
   */
  streamId: {
    invocationId: string
  };

  /**
   * Detailed tool information about this invocation
   */
  invocationDetails: InvocationDetails;

  /**
   * Detailed information about the running host that the build tool was invoked on
   */
  hostDetails: HostDetails;

  /**
   * Data relating to the configured targets of this invocation
   */
  targets: TargetMap;

  /**
   * Build progress, that is stdout and stderr
   */
  progress: string[];

  /**
   * A list of deps fetched for this invocation
   */
  fetched: FetchedResource[];

  /**
   * Contents of the resolved workspace status key / value pairs
   */
  workspaceStatus?: WorkspaceStatusItems;

  /**
   * Structured parsed bazel command line
   */
  canonicalStructuredCommandLine?: StructuredCommandLine;

  /**
   * A set of files that are referenced by the targets in this invocation
   */
  fileSets?: FileSet;
}

export class Invocation {
  public state = 'started';

  private _change$ = new Subject<BesEvent<any>>();

  constructor(public ref?: InvocationRef) {}

  static init(invocationId: string): Invocation {
    const invocation = new Invocation();
    invocation.init(invocationId);

    return invocation;
  }

  static fromRef(ref: InvocationRef): Invocation {
    return new Invocation(ref);
  }

  dispose() {
    this._change$.complete();
  }

  init(invocationId: string) {
    this.ref = {
      streamId: {
        invocationId
      },
      targets: {},
      invocationDetails: {
        metrics: {
          packagesLoaded: 0,
          actionsExecuted: 0,
          actionsCreated: 0
        }
      },
      hostDetails: {},
      progress: [],
      fetched: [],
      fileSets: {}
    }
  };

  notifyStateChange() {
    this._notifyChange(EventType.STATE_EVENT);
  }

  notifyDetailsChange() {
    this._notifyChange(EventType.INVOCATION_DETAILS_EVENT);
  }

  notifyHostDetailsChange() {
    this._notifyChange(EventType.HOST_DETAILS_EVENT);
  }

  notifyTargetsChange(changes: TargetMap) {
    this._notifyChange(EventType.TARGETS_EVENT, changes);
  }

  notifyProgressChange(lines: string) {
    this._notifyChange(EventType.PROGRESS_EVENT, lines);
  }

  notifyWorkspaceStatusChange() {
    this._notifyChange(EventType.WORKSPACE_STATUS_EVENT);
  }

  notifyCanonicalStructuredCommandLineChange() {
    this._notifyChange(EventType.COMMAND_LINE);
  }

  notifyFetchedChanged(fetched: FetchedResource) {
    this._notifyChange(EventType.FETCHED_EVENT, fetched);
  }

  notifyFilesetChanged(changed: FileSet) {
    this._notifyChange(EventType.FILE_SET_EVENT, changed);
  }

  get changes$(): Observable<BesEvent<any>> {
    return this._change$.asObservable();
  }

  get details$(): Observable<InvocationDetails> {
    return this._change$
      .pipe(this.select(EventType.INVOCATION_DETAILS_EVENT, () => this.ref.invocationDetails));
  }

  get state$(): Observable<string> {
    return this._change$
      .pipe(this.select(EventType.STATE_EVENT, () => this.state));
  }

  get hostDetails$(): Observable<HostDetails> {
    return this._change$
      .pipe(this.select(EventType.HOST_DETAILS_EVENT, () => this.ref.hostDetails));
  }

  get workspaceStatus$(): Observable<WorkspaceStatusItems> {
    return this._change$
      .pipe(this.select(EventType.WORKSPACE_STATUS_EVENT, () => this.ref.workspaceStatus));
  }

  get canonicalStructuredCommandLine$(): Observable<StructuredCommandLine> {
    return this._change$
      .pipe(this.select(EventType.COMMAND_LINE, () => this.ref.canonicalStructuredCommandLine));
  }

  get progress$(): Observable<string> {
    return this._change$.pipe(this.select(EventType.PROGRESS_EVENT));
  }

  get targets$(): Observable<TargetMap> {
    return this._change$.pipe(this.select(EventType.TARGETS_EVENT));
  }

  get fetched$(): Observable<FetchedResource> {
    return this._change$.pipe(this.select(EventType.FETCHED_EVENT));
  }

  get fileSet$(): Observable<FileSet> {
    return this._change$.pipe(this.select(EventType.FILE_SET_EVENT));
  }

  private _notifyChange(event: string, payload?: any) {
    this._change$.next(BesEventFactory(event, this.ref.streamId.invocationId, payload));
  }

  private select<T, U>(event: string, selector?: (payload: any | undefined) => T) {
    return (observable: Observable<BesEvent<U>>) => {
      return observable.pipe(
        filter(e => e.event === event),
        map(e => selector ? selector(e.data.payload) : e.data.payload)
      )
    }
  }
}
