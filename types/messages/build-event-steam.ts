import { Long } from 'long';

import { CommandLine } from './command-line';
import { InvocationPolicy } from './invocation-policy';

export interface ConfigurationId {
  // Identifier of the configuration; users of the protocol should not make
  // any assumptions about it having any structure, or equality of the
  // identifier between different streams.
  id: string;
}

export interface PatternExpandedId {
  pattern: string[];
}

export interface NamedSetOfFilesId {
  // Identifier of the file set; this is an opaque string valid only for the
  // particular instance of the event stream.
  id: string;
}

// Identifier for a build event. It is deliberately structured to also provide
// information about which build target etc the event is related to.
//
// Events are chained via the event id as follows: each event has an id and a
// set of ids of children events such that apart from the initial event each
// event has an id that is mentioned as child id in an earlier event and a build
// invocation is complete if and only if all direct and indirect children of the
// initial event have been posted.
export interface BuildEventId {
  // Generic identifier for a build event. This is the default type of
  // BuildEventId, but should not be used outside testing; nevertheless,
  // tools should handle build events with this kind of id gracefully.
  unknown?: {
    details: string;
  };

  // Identifier of an event reporting progress. Those events are also used to
  // chain in events that come early.
  progress?: {
    // Unique identifier. No assumption should be made about how the ids are
    // assigned; the only meaningful operation on this field is test for
    // equality.
    opaqueCount: number;
  };

  // Identifier of an event indicating the beginning of a build; this will
  // normally be the first event.
  started?: {};

  // Identifier on an event indicating the original commandline received by
  // the bazel server.
  unstructuredCommandLine?: {};

  // Identifier on an event describing the commandline received by Bazel.
  structuredCommandLine?: {
    // A title for this command line value, as there may be multiple.
    // For example, a single invocation may wish to report both the literal and
    // canonical command lines, and this label would be used to differentiate
    // between both versions.
    commandLineLabel: string;
  };

  // Identifier of an event indicating the workspace status.
  workspaceStatus?: {};

  // Identifier on an event reporting on the options included in the command
  // line, both explicitly and implicitly.
  optionsParsed?: {};

  // Identifier of an event reporting that an external resource was fetched
  // from.
  fetch?: {
    // The external resource that was fetched from.
    url: string;
  };

  // Identifier of an event introducing a configuration.
  configuration?: ConfigurationId;

  // Identifier of an event indicating that a target has been expanded by
  // identifying for which configurations it should be build.
  targetConfigured?: {
    label: string;

    // If not empty, the id refers to the expansion of the target for a given
    // aspect.
    aspect?: string;
  };

  // Identifier of an event indicating that a target pattern has been expanded
  // further.
  // Messages of this shape are also used to describe parts of a pattern that
  // have been skipped for some reason, if the actual expansion was still
  // carried out (e.g., if keep_going is set). In this case, the
  // pattern_skipped choice in the id field is to be made.
  pattern?: PatternExpandedId;

  patternSkipped?: PatternExpandedId;

  // Identifier of an event introducing a named set of files (usually artifacts)
  // to be referred to in later messages.
  namedSet?: NamedSetOfFilesId;

  // Identifier of an event indicating that a target was built completely; this
  // does not include running the test if the target is a test target.
  targetCompleted?: {
    label: string;

    // The configuration for which the target was built.
    configuration: ConfigurationId

    // If not empty, the id refers to the completion of the target for a given
    // aspect.
    aspect?: string;
  };

  // Identifier of an event reporting that an action was completed (not all
  // actions are reported, only the ones that can be considered important;
  // this includes all failed actions).
  actionComplete?: {
    primaryOutput: string;

    // Optional, the label of the owner of the action, for reference.
    label?: string;

    // Optional, the id of the configuration of the action owner.
    configuration?: ConfigurationId;
  };

  // Identifier of an event reporting an event associated with an unconfigured
  // label. Usually, this indicates a failure due to a missing input file. In
  // any case, it will report some form of error (i.e., the payload will be an
  // Aborted event); there are no regular events using this identifier. The
  // purpose of those events is to serve as the root cause of a failed target.
  unconfiguredLabel?: {
    label: string;
  };

  // Identifier of an event reporting an event associated with a configured
  // label, usually a visibility error. In any case, an event with such an
  // id will always report some form of error (i.e., the payload will be an
  // Aborted event); there are no regular events using this identifier.
  configuredLabel?: {
    label: string;
    configuration: ConfigurationId;
  };

  // Identifier of an event reporting on an individual test run. The label
  // identifies the test that is reported about, the remaining fields are
  // in such a way as to uniquely identify the action within a build. In fact,
  // attempts for the same test, run, shard triple are counted sequentially,
  // starting with 1.
  testResult?: {
    label: string;
    configuration: ConfigurationId;
    run: number;
    shard: number;
    attempt: string;
  };

  // Identifier of an event reporting the summary of a test.
  testSummary?: {
    label: string;
    configuration: ConfigurationId;
  };

  // Identifier of the BuildFinished event, indicating the end of a build.
  buildFinished?: {};

  // Identifier of an event providing additional logs/statistics after
  // completion of the build.
  buildToolLogs?: {};

  // Identifier of an event providing build metrics after completion
  // of the build.
  buildMetrics?: {};

  workspace?: {};

  buildMetadata?: {};

  // Identifier of an event providing convenience symlinks information.
  convenienceSymlinksIdentified?: {};
}

// Payload of an event summarizing the progress of the build so far. Those
// events are also used to be parents of events where the more logical parent
// event cannot be posted yet as the needed information is not yet complete.
export interface Progress {
  // The next chunk of stdout that bazel produced since the last progress event
  // or the beginning of the build.
  stdout: string;

  // The next chunk of stderr that bazel produced since the last progress event
  // or the beginning of the build.
  stderr: string;
}

export enum AbortReason {
  UNKNOWN = 0,
  
  // The user requested the build to be aborted (e.g., by hitting Ctl-C).
  USER_INTERRUPTED = 1,
  
  // The user requested that no analysis be performed.
  NO_ANALYZE = 8,
  
  // The user requested that no build be carried out.
  NO_BUILD = 9,
  
  // The build or target was aborted as a timeout was exceeded.
  TIME_OUT = 2,
  
  // The build or target was aborted as some remote environment (e.g., for
  // remote execution of actions) was not available in the expected way.
  REMOTE_ENVIRONMENT_FAILURE = 3,
  
  // Failure due to reasons entirely internal to the build tool, e.g.,
  // running out of memory.
  INTERNAL = 4,
  
  // A Failure occurred in the loading phase of a target.
  LOADING_FAILURE = 5,
  
  // A Failure occurred in the analysis phase of a target.
  ANALYSIS_FAILURE = 6,
  
  // Target build was skipped (e.g. due to incompatible CPU constraints).
  SKIPPED = 7,
  
  // Build incomplete due to an earlier build failure (e.g. --keep_going was
  // set to false causing the build be ended upon failure).
  INCOMPLETE = 10
}

export interface Aborted {
  reason: AbortReason;

  // A human readable description with more details about there reason, where
  // available and useful.
  description?: string; 
}

// Payload of an event indicating the beginning of a new build. Usually, events
// of those type start a new build-event stream. The target pattern requested
// to be build is contained in one of the announced child events; it is an
// invariant that precisely one of the announced child events has a non-empty
// target pattern.
export interface BuildStarted {
  uuid: string;
  
  // Start of the build in ms since the epoch.
  startTimeMillis: Long;
  
  // Version of the build tool that is running.
  buildToolVersion: string;
  
  // A human-readable description of all the non-default option settings
  optionsDescription: string;
  
  // The name of the command that the user invoked.
  command: string;
  
  // The working directory from which the build tool was invoked.
  workingDirectory: string;
  
  // The directory of the workspace.
  workspaceDirectory: string;
  
  // The process ID of the Bazel server.
  serverPid: Long;
}

// Payload of an event reporting the command-line of the invocation as
// originally received by the server. Note that this is not the command-line
// given by the user, as the client adds information about the invocation,
// like name and relevant entries of rc-files and client environment variables.
// However, it does contain enough information to reproduce the build
// invocation.
export interface UnstructuredCommandLine {
  args: string[];
}

// Payload of an event reporting on the parsed options, grouped in various ways.
export interface OptionsParsed {
  startupOptions: string[];
  explicitStartupOptions: string[];
  cmdLine: string[];
  explicitCmdLine: string[];
  invocationPolicy: InvocationPolicy;
  toolTag?: string;
}

// Payload of an event reporting the workspace status. Key-value pairs can be
// provided by specifying the workspace_status_command to an executable that
// returns one key-value pair per line of output (key and value separated by a
// space).
export interface WorkspaceStatus {
  item: Array<{ key: string, value: string }>;
}

// Payload of an event indicating that an external resource was fetched. This
// event will only occur in streams where an actual fetch happened, not in ones
// where a cached copy of the entity to be fetched was used.
export interface Fetch {
  success: boolean;
}

// Payload of an event reporting details of a given configuration.
export interface Configuration {
  mnemonic: string;
  platformName: string;
  cpu: string
  makeVariable: { [key: string]: string }
}

// Payload of the event indicating the expansion of a target pattern.
// The main information is in the chaining part: the id will contain the
// target pattern that was expanded and the children id will contain the
// target or target pattern it was expanded to.
export interface PatternExpanded {}

// Enumeration type characterizing the size of a test, as specified by the
// test rule.
export enum TestSize {
  UNKNOWN = 0,
  SMALL = 1,
  MEDIUM = 2,
  LARGE = 3,
  ENORMOUS = 4
}

// Payload of the event indicating that the configurations for a target have
// been identified. As with pattern expansion the main information is in the
// chaining part: the id will contain the target that was configured and the
// children id will contain the configured targets it was configured to.
export interface TargetConfigured {
  // The kind of target (e.g.,  e.g. "cc_library rule", "source file",
  // "generated file") where the completion is reported.
  targetKind: string;

  // The size of the test, if the target is a test target. Unset otherwise.
  testSize: TestSize;

  // List of all tags associated with this target (for all possible
  // configurations).
  tag: string[];
}

export interface File {
  // A sequence of prefixes to apply to the file name to construct a full path.
  // In most but not all cases, there will be 3 entries:
  //  1. A root output directory, eg "bazel-out"
  //  2. A configuration mnemonic, eg "k8-fastbuild"
  //  3. An output category, eg "genfiles"
  pathPrefix: string[];

  // identifier indicating the nature of the file (e.g., "stdout", "stderr")
  name: string;

  // A location where the contents of the file can be found. The string is
  // encoded according to RFC2396.
  uri?: string;

  // The contents of the file, if they are guaranteed to be short.
  contents?: Uint8Array;
}

// Payload of the event indicating the completion of an action. The main purpose
// of posting those events is to provide details on the root cause for a target
// failing; however, consumers of the build-event protocol must not assume
// that only failed actions are posted.
export interface ActionExecuted {
  success: boolean;

  // The mnemonic of the action that was executed
  type: string;

  // The exit code of the action, if it is available.
  exitCode: number;

  // Location where to find the standard output of the action
  // (e.g., a file path).
  stdout: File;

  // Location where to find the standard error of the action
  // (e.g., a file path).
  stderr: File;

  // Deprecated. This field is now present on ActionCompletedId.
  label?: string;

  // Deprecated. This field is now present on ActionCompletedId.
  configuration?: ConfigurationId;

  // Primary output; only provided for successful actions.
  primaryOutput: File;

  // The command-line of the action, if the action is a command.
  commandLine: string[];

  // List of paths to log files
  actionMetadataLogs: File[];
}

// Payload of a message to describe a set of files, usually build artifacts, to
// be referred to later by their name. In this way, files that occur identically
// as outputs of several targets have to be named only once.
export interface NamedSetOfFiles {
  // Files that belong to this named set of files.
  files: File[];

  // Other named sets whose members also belong to this set.
  fileSets: NamedSetOfFilesId[];
}

// Collection of all output files belonging to that output group.
export interface OutputGroup {
  // Name of the output group
  name: string;

  // List of file sets that belong to this output group as well.
  fileSets: NamedSetOfFilesId[];
}

// Payload of the event indicating the completion of a target. The target is
// specified in the id. If the target failed the root causes are provided as
// children events.
export interface TargetCompleted {
  success: boolean;

  // The kind of target (e.g.,  e.g. "cc_library rule", "source file",
  // "generated file") where the completion is reported.
  // Deprecated: use the target_kind field in TargetConfigured instead.
  /**
   * @deprecated
   */
  targetKind?: string;

  // The size of the test, if the target is a test target. Unset otherwise.
  // Deprecated: use the test_size field in TargetConfigured instead.
  /**
   * @deprecated
   */
  testSize: string;

  // The output files are arranged by their output group. If an output file
  // is part of multiple output groups, it appears once in each output
  // group.
  outputGroup: OutputGroup[];

  // Temporarily, also report the important outputs directly. This is only to
  // allow existing clients help transition to the deduplicated representation;
  // new clients should not use it.
  /**
   * @deprecated
   */
  importantOutput: File[];

  // List of tags associated with this configured target.
  tag: string[];

  // The timeout specified for test actions under this configured target.
  testTimeoutSeconds: Long;
}

// Represents a hierarchical timing breakdown of an activity.
// The top level time should be the total time of the activity.
// Invariant: time_millis >= sum of time_millis of all direct children.
export interface TimingBreakdown {
  child: TimingBreakdown[];
  name: string;
  timeMillis: Long;
}

export interface ResourceUsage {
  name: string;
  value: Long;
}

// Message providing optional meta data on the execution of the test action,
// if available.
export interface ExecutionInfo {
  // Deprecated, use TargetComplete.test_timeout_seconds instead.
  /**
   * @deprecated
   */
  timeoutSections: number;

  // Name of the strategy to execute this test action (e.g., "local",
  // "remote")
  strategy: string;

  // True, if the reported attempt was a cache hit in a remote cache.
  cachedRemotely: boolean;

  // The exit code of the test action.
  exitCode: number;

  // The hostname of the machine where the test action was executed (in case
  // of remote execution), if known.
  hostname: string;

  timingBreakdown: TimingBreakdown;

  resourceUsage: ResourceUsage[];
}

export enum TestStatus {
  NO_STATUS = 0,
  PASSED = 1,
  FLAKY = 2,
  TIMEOUT = 3,
  FAILED = 4,
  INCOMPLETE = 5,
  REMOTE_FAILURE = 6,
  FAILED_TO_BUILD = 7,
  TOOL_HALTED_BEFORE_TESTING = 8
}

// Payload on events reporting about individual test action.
export interface TestResult {
  // The status of this test.
  status: TestStatus;

  // Additional details about the status of the test. This is intended for
  // user display and must not be parsed.
  statusDetails: string

  // True, if the reported attempt is taken from the tool's local cache.
  cachedLocally: boolean;

  // Time in milliseconds since the epoch at which the test attempt was started.
  // Note: for cached test results, this is time can be before the start of the
  // build.
  testAttemptStartMillisEpoch: Long;

  // Time the test took to run. For locally cached results, this is the time
  // the cached invocation took when it was invoked.
  testAttemptDurationMillis: Long;

  // Files (logs, test.xml, undeclared outputs, etc) generated by that test
  // action.
  testActionOutput: File[];

  // Warnings generated by that test action.
  warning?: string;

  executionInfo: ExecutionInfo;
}

// Payload of the event summarizing a test.
export interface TestSummary {
  // Wrapper around BlazeTestStatus to support importing that enum to proto3.
  // Overall status of test, accumulated over all runs, shards, and attempts.
  overallStatus: TestStatus;

  // Total number of runs
  totalRunCount: number;

  // Path to logs of passed runs.
  passed?: File[];

  // Path to logs of failed runs;
  failed?: File[];

  // Total number of cached test actions
  totalNumCached: number;

  // When the test first started running.
  firstStartTimeMillis: Long;

  // When the last test action completed.
  lastStopTimeMillis: Long;

  // The total runtime of the test.
  totalRunDurationMillis: Long;
}

// Exit code of a build. The possible values correspond to the predefined
// codes in bazel's lib.ExitCode class, as well as any custom exit code a
// module might define. The predefined exit codes are subject to change (but
// rarely do) and are not part of the public API.
//
// A build was successful iff ExitCode.code equals 0.
export interface ExitCode {
  // The name of the exit code.
  name: string;

  // The exit code.
  code: number;
}

// Things that happened during the build that could be of interest.
export interface AnomalyReport {
  // Was the build suspended at any time during the build.
  // Examples of suspensions are SIGSTOP, or the hardware being put to sleep.
  // If was_suspended is true, then most of the timings for this build are
  // suspect.
  wasSuspended?: boolean;
}

// Event indicating the end of a build.
export interface BuildFinished {
  // If the build succeeded or failed.
  /**
   * @deprecated
   */
  overallSuccess: boolean;

  // The overall status of the build. A build was successful if
  // ExitCode.code equals 0.
  exitCode: ExitCode;

  // Time in milliseconds since the epoch.
  finishTimeMillis: Long;

  anomalyReport: AnomalyReport;
}

// Event providing additional statistics/logs after completion of the build.
export interface BuildToolLogs {
  log: File[];
}

export interface BuildMetrics {
  actionSummary: {
    // The total number of actions created and registered during the build.
    // This includes unused actions that were constructed but
    // not executed during this build.
    actionsCreated: Long;

    // The total number of actions executed during the build.
    // This includes any remote cache hits, but excludes
    // local action cache hits.
    actionsExecuted: Long;
  };

  memoryMetrics: {
    // Size of the JVM heap post build in bytes. This is only collected if
    // --bep_publish_used_heap_size_post_build is set,
    // since it forces a full GC.
    usedHeapSizePostBuild: Long;
  };

  targetMetrics: {
    // Number of targets loaded during this build.
    targetsLoaded: Long;

    // Number of targets configured during this build. This can
    // be greater than targets_loaded if the same target is configured
    // multiple times.
    targetsConfigured: Long;
  };

  packageMetrics: {
    // Number of BUILD files (aka packages) loaded during this build.
    packagesLoaded: Long;
  };

  timingMetrics: {
    // The CPU time in milliseconds consumed during this build.
    cpuTimeInMs: Long;
    // The elapsed wall time in milliseconds during this build.
    wallTimeInMs: Long;
  };
}

// Configuration related to the blaze workspace and output tree.
export interface WorkspaceConfig {
  // The root of the local blaze exec root. All output files live underneath
  // this at "blaze-out/".
  localExecRoot: string;
}

// Payload of an event reporting custom key-value metadata associated with the
// build.
export interface BuildMetadata {
  // Custom metadata for the build.
  metadata?: { [key: string]: string };
}

export enum Action {
  UNKNOWN = 0,

  // Indicates a symlink should be created, or overwritten if it already
  // exists.
  CREATE = 1,

  // Indicates a symlink should be deleted if it already exists.
  DELETE = 2
}

// The message that contains what type of action to perform on a given path and
// target of a symlink.
export interface ConvenienceSymlink {
  // The path of the symlink to be created or deleted, absolute or relative to
  // the workspace, creating any directories necessary. If a symlink already
  // exists at that location, then it should be replaced by a symlink pointing
  // to the new target.
  path: string;

  // The operation we are performing on the symlink.
  action: Action;

  // If action is CREATE, this is the target path that the symlink should point
  // to. If the path points underneath the output base, it is relative to the
  // output base; otherwise it is absolute.
  //
  // If action is DELETE, this field is not set.
  target: string;
}

// Event describing all convenience symlinks (i.e., workspace symlinks) to be
// created or deleted once the execution phase has begun. Note that this event
// does not say anything about whether or not the build tool actually executed
// these filesystem operations; it only says what logical operations should be
// performed. This event is emitted exactly once per build; if no symlinks are
// to be modified, the event is still emitted with empty contents.
export interface ConvenienceSymlinksIdentified {
  convenienceSymlinks: ConvenienceSymlink[];
}

// Message describing a build event. Events will have an identifier that
// is unique within a given build invocation; they also announce follow-up
// events as children. More details, which are specific to the kind of event
// that is observed, is provided in the payload. More options for the payload
// might be added in the future.
export interface BuildEvent {
  id: BuildEventId;
  children: BuildEventId[];
  lastMessage?: boolean;

  // one of...
  progress?: Progress;
  aborted?: Aborted;
  started?: BuildStarted;
  unstructuredCommandLine?: UnstructuredCommandLine;
  structuredCommandLine?: CommandLine;
  optionsParsed?: OptionsParsed;
  workspaceStatus?: WorkspaceStatus;
  fetch?: Fetch;
  configuration?: Configuration;
  expanded?: PatternExpanded;
  configured?: TargetConfigured;
  action?: ActionExecuted;
  namedSetOfFiles?: NamedSetOfFiles;
  completed?: TargetCompleted;
  testResult?: TestResult;
  testSummary?: TestSummary;
  finished?: BuildFinished;
  buildToolLogs?: BuildToolLogs;
  buildMetrics?: BuildMetrics;
  workspaceInfo?: WorkspaceConfig;
  buildMetadata?: BuildMetadata;
  convenienceSymlinksIdentified?: ConvenienceSymlinksIdentified;
}
