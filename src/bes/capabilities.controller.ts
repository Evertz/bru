import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import {
  Capabilities,
  DigestFunctionValue,
  GetCapabilitiesRequest,
  ServerCapabilities,
  SymlinkAbsolutePathStrategyValue
} from '../../types/messages/remote-execution';

@Controller()
export class CapabilitiesController implements Capabilities {

  @GrpcMethod('Capabilities', 'GetCapabilities')
  getCapabilities(request: GetCapabilitiesRequest): ServerCapabilities {
    return {
      cacheCapabilities: {
        digestFunction: [DigestFunctionValue.SHA256],
        actionCacheUpdateCapabilities: {
          updateEnabled: true,
        },
        cachePriorityCapabilities: {
          priorities: [{ maxPriority: 0, minPriority: 0 }]
        },
        maxBatchTotalSizeBytes: 0,
        symlinkAbsolutePathStrategy: SymlinkAbsolutePathStrategyValue.ALLOWED
      },
      lowApiVersion: {
        major: 2
      },
      highApiVersion: {
        major: 99,
        minor: 9
      }
    }
  }
}
