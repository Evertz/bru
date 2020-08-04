import { Controller, Get, Param } from '@nestjs/common';

import { DefaultInvocationHandler } from '../bes/handlers/default-invocation-handler.service';
import { BesEventData, BesEventFactory, EventType } from '../../types/events';
import {
  FileSet,
  HostDetails, Invocation,
  InvocationDetails,
  StructuredCommandLine,
  WorkspaceStatusItems
} from '../../types/invocation-ref';

@Controller('/v1/query')
export class DashController {

  constructor(private readonly handler: DefaultInvocationHandler) {}

  @Get(':invocation/workspacestatus')
  async getInvocationWorkspaceStatus(@Param('invocation') invocationId: string): Promise<BesEventData<WorkspaceStatusItems>> {
    return this.select(EventType.WORKSPACE_STATUS_EVENT, invocationId, invocation => invocation.ref.workspaceStatus);
  }

  @Get(':invocation/commandline')
  async getInvocationCommandLine(@Param('invocation') invocationId: string): Promise<BesEventData<StructuredCommandLine>> {
    return this.select(EventType.COMMAND_LINE, invocationId, invocation => invocation.ref.canonicalStructuredCommandLine);
  }

  @Get(':invocation/hostdetails')
  async getInvocationHostDetails(@Param('invocation') invocationId: string): Promise<BesEventData<HostDetails>> {
    return this.select(EventType.HOST_DETAILS_EVENT, invocationId, invocation => invocation.ref.hostDetails);
  }

  @Get(':invocation/details')
  async getInvocationDetails(@Param('invocation') invocationId: string): Promise<BesEventData<InvocationDetails>> {
    return this.select(EventType.INVOCATION_DETAILS_EVENT, invocationId, invocation => invocation.ref.invocationDetails);
  }

  @Get(':invocation/filesets')
  async getFilesets(@Param('invocation') invocationId: string): Promise<BesEventData<FileSet>> {
    return this.select(EventType.FILE_SET_EVENT, invocationId, invocation => invocation.ref.fileSets);
  }

  private select<T>(event: string, invocationId: string, selector: (invocation: Invocation) => T): BesEventData<T> | undefined {
    const invocation = this.handler.queryFor(invocationId);
    if (!invocation) {
      return;
    }
    return BesEventFactory(event, invocationId, selector(invocation)).data;
  }
}
