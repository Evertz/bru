import { Logger } from '@nestjs/common';

import { BuildEventHandler } from './invocation-handler';
import { FileSet, Invocation, OutputFile } from '../../../types/invocation-ref';
import { StreamId } from '../../../types/messages/build-events';
import { BuildEvent, TestSize, TestStatus } from '../../../types/messages/build-event-steam';

export class DefaultBuildEventHandler extends BuildEventHandler {
  private readonly logger = new Logger(DefaultBuildEventHandler.name);

  constructor(private readonly verbose = false) {
    super();
  }

  handleStarted(invocation: Invocation, streamId: StreamId, event: BuildEvent): boolean {
    invocation.ref.invocationDetails.buildToolVersion = event.started.buildToolVersion;
    invocation.ref.invocationDetails.command = event.started.command;
    invocation.ref.invocationDetails.startTimeMillis = event.started.startTimeMillis.toString(10);
    invocation.ref.invocationDetails.workspaceDirectory = event.started.workspaceDirectory;
    invocation.state = 'running';

    invocation.notifyDetailsChange();
    invocation.notifyStateChange();

    return true;
  }

  handleBuildFinished(invocation: Invocation, streamId: StreamId, event: BuildEvent): boolean {
    invocation.ref.invocationDetails.exitCode = event.finished.exitCode;
    invocation.ref.invocationDetails.finishTimeMillis = event.finished.finishTimeMillis.toString(10);
    invocation.state = event.finished.exitCode.code === 0 ? 'successful' : 'failed';

    invocation.notifyDetailsChange();
    invocation.notifyStateChange();

    return true;
  }

  handleNamedSet(invocation: Invocation, streamId: StreamId, event: BuildEvent): boolean {
    const set = event.namedSetOfFiles;
    const id = event.id.namedSet.id;

    const files: OutputFile[] = set.files?.map(file => {
      return {
        location: this.stripUriPrefix(file.uri),
        name: file.name,
        prefix: file.pathPrefix
      }
    });

    const refs = set.fileSets?.map(set => set.id);
    const fileset = { files, refs }
    invocation.ref.fileSets[id] = fileset;

    const incoming = { [id]: fileset };
    invocation.notifyFilesetChanged(incoming);

    return true;
  }

  handleTargetCompleted(invocation: Invocation, streamId: StreamId, event: BuildEvent): boolean {
    const target = invocation.ref.targets[event.id.targetCompleted.label];
    if (!target) { return false; }

    if (event.completed) {
      const completed = event.completed;
      target.success = completed.success;
      target.state = 'completed';

      if (completed.outputGroup) {
        const outputs: FileSet = {};

        completed.outputGroup.forEach(output => {
          outputs[output.name] = { refs: output.fileSets.map(fileSet => fileSet.id) }
        });
        if (Object.keys(outputs).length) {
          target.outputs = outputs;
        }
      }
    } else if (event.aborted) {
      target.success = false;
      target.state = 'aborted';
      target.abortDescription = event.aborted.description;
    } else {
      return false;
    }

    invocation.notifyTargetsChange({ [target.label]: target });

    return true;
  }

  handleTargetConfigured(invocation: Invocation, streamId: StreamId, event: BuildEvent): boolean {
    const label = event.id.targetConfigured.label;
    const configured = event.configured;

    invocation.ref.targets[label] = {
      state: 'configured',
      label: label,
      size: TestSize[configured.testSize],
      kind: configured.targetKind,
      tags: configured.tag
    };

    invocation.notifyTargetsChange({ [label]: invocation.ref.targets[label] });

    return true;
  }

  handleTestResult(invocation: Invocation, streamId: StreamId, event: BuildEvent): boolean {
    const label = event.id.testResult.label;
    const target = invocation.ref.targets[label];

    if (!target) { return false; }

    if (!event.testResult) {
      // target could have been aborted
      return false;
    }

    // TODO(mmackay): move support for multiple test runs to Bru from BES
    target.testResult = {
      status: TestStatus[event.testResult.status],
      duration: event.testResult.testAttemptDurationMillis.toNumber(),
      start: event.testResult.testAttemptStartMillisEpoch.toNumber(),
      strategy: event.testResult.executionInfo?.strategy,
      cached: event.testResult.executionInfo.cachedRemotely || event.testResult.cachedLocally,
      attempt: event.id.testResult.attempt,
      run: event.id.testResult.run
    };

    if (event.testResult.testActionOutput) {
      const output = event.testResult.testActionOutput;
      const testLog = output.find(out => out.name === 'test.log');
      const testXML = output.find(out => out.name === 'test.xml');

      if (testLog) {
        target.testResult.log = {
          name: testLog.name,
          location: this.stripUriPrefix(testLog.uri),
          prefix: testLog.pathPrefix
        };
      }

      if (testXML) {
        target.testResult.report = {
          name: testXML.name,
          location: this.stripUriPrefix(testXML.uri),
          prefix: testXML.pathPrefix
        };
      }
    }

    invocation.notifyTargetsChange({ [label]: target });

    const testSummary = invocation.ref.invocationDetails.testSummary ?? { failed: 0, flaky: 0, successful: 0, total: 0 };
    if(target.testResult.status === 'PASSED') {
      testSummary.successful++;
    } else if (target.testResult.status === 'FLAKY') {
      testSummary.flaky++;
    } else {
      testSummary.failed++;
    }

    testSummary.total++;
    invocation.ref.invocationDetails.testSummary = testSummary;

    invocation.notifyDetailsChange();
    return true;
  }

  handleTestSummary(invocation: Invocation, streamId: StreamId, event: BuildEvent): boolean {
    return false;
  }

  handleActionComplete(invocation: Invocation, streamId: StreamId, event: BuildEvent): boolean {
    const label = event.id.actionComplete.label;
    if (!label) {
      this.logger.warn(`Orphaned action found`);
      this.logger.warn(event.action);

      return false;
    }

    const target = invocation.ref.targets[label];
    if (!target) { return false; }
    // what to store?
  }

  handleBuildMetrics(invocation: Invocation, streamId: StreamId, event: BuildEvent): boolean {
    invocation.ref.invocationDetails.metrics = {
      actionsCreated: event.buildMetrics.actionSummary.actionsCreated?.toNumber(),
      actionsExecuted: event.buildMetrics.actionSummary.actionsExecuted?.toNumber(),
      packagesLoaded: event.buildMetrics.packageMetrics.packagesLoaded?.toNumber()
    };

    invocation.notifyDetailsChange();

    return true;
  }

  handleBuildMetadata(invocation: Invocation, streamId: StreamId, event: BuildEvent): boolean {
    if (Object.keys(event.buildMetadata.metadata).length === 0) { return false; }
    invocation.ref.invocationDetails.metadata = event.buildMetadata.metadata;

    invocation.notifyDetailsChange();

    return true;
  }

  handlePattern(invocation: Invocation, streamId: StreamId, event: BuildEvent): boolean {
    invocation.ref.invocationDetails.pattern = event.id.pattern.pattern;

    invocation.notifyDetailsChange();

    return true;
  }

  handleProgress(invocation: Invocation, streamId: StreamId, event: BuildEvent): boolean {
    const stdout = event.progress.stdout;
    const stderr = event.progress.stderr;
    const lines = stderr + stdout;

    if (!lines.length) {
      return false;
    }

    invocation.ref.progress.push(lines);
    invocation.notifyProgressChange(lines);

    return true;
  }

  handleConfiguration(invocation: Invocation, streamId: StreamId, event: BuildEvent): boolean {
    invocation.ref.hostDetails.cpu = event.configuration.cpu;
    invocation.ref.hostDetails.platformName = event.configuration.platformName;
    invocation.ref.invocationDetails.makeVariables = event.configuration.makeVariable;

    invocation.notifyHostDetailsChange();
    invocation.notifyDetailsChange();

    return true;
  }

  handleWorkspaceStatus(invocation: Invocation, streamId: StreamId, event: BuildEvent): boolean {
    invocation.ref.workspaceStatus = event.workspaceStatus.item;
    invocation.notifyWorkspaceStatusChange();

    return true;
  }

  handleStructuredCommandLine(invocation: Invocation, streamId: StreamId, event: BuildEvent): boolean {
    if (event.structuredCommandLine.commandLineLabel !== 'canonical') { return false; }

    const sections = event.structuredCommandLine.sections;

    const executable = sections.find(section => section.sectionLabel === 'executable').chunkList.chunk;
    const command = sections.find(section => section.sectionLabel === 'command').chunkList.chunk;
    const residual = sections.find(section => section.sectionLabel === 'residual').chunkList.chunk;

    const startupArgsOptionList = sections
      .find(section => section.sectionLabel === 'startup options').optionList.option;

    const startupArgs = startupArgsOptionList ?
      startupArgsOptionList.map(option => ({ optionName: option.optionName, optionValue: option.optionValue })) : [];

    const commandArgsOptionList = sections
      .find(section => section.sectionLabel === 'command options').optionList.option;

    const commandArgs = commandArgsOptionList ?
      commandArgsOptionList.map(option => ({ optionName: option.optionName, optionValue: option.optionValue })) : [];

    invocation.ref.canonicalStructuredCommandLine = {
      sections: {
        command,
        startupArgs,
        commandArgs,
        executable,
        residual
      }
    };

    invocation.notifyCanonicalStructuredCommandLineChange();

    return true;
  }

  handleFetch(invocation: Invocation, streamId: StreamId, event: BuildEvent): boolean {
    const resource = { url: event.id.fetch.url, success: event.fetch.success };

    invocation.ref.fetched.push(resource);
    invocation.notifyFetchedChanged(resource);

    return true;
  }

  private stripUriPrefix(uri: string): string {
    const index = uri.indexOf('/blobs/');
    return uri.substr(index);
  }

  /**
   * Given a file set Id, returns a list of output files, optionally recursively resolved from that entrypoint id
   */
  private findAllFilesForInitialSet(id: string, invocation: Invocation, files: OutputFile[] = [], deep = false): OutputFile[] {
    const fileSet = invocation.ref.fileSets[id];
    if (fileSet) {
      files = files.concat(fileSet.files);
      if (fileSet.refs?.length && deep) {
        fileSet.refs.forEach(ref => this.findAllFilesForInitialSet(ref, invocation, files, true));
      }
    }

    return files;
  }
}
