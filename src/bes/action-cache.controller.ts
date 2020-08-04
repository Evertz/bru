import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';

import {
  ActionCache,
  ActionResult,
  GetActionResultRequest,
  UpdateActionResultRequest
} from '../../types/messages/remote-execution';
import { RpcStatusCode } from '../../types/messages/status';
import { PersistenceService } from '../persistence/persistence.service';

@Controller()
export class ActionCacheController implements ActionCache {
  private readonly logger = new Logger(ActionCacheController.name);

  constructor(private readonly persistenceService: PersistenceService) {}

  @GrpcMethod('ActionCache', 'GetActionResult')
  getActionResult(request: GetActionResultRequest): ActionResult {
    const hash = request.actionDigest.hash;
    const result = this.persistenceService.fetchActionResult(hash);

    this.logger.verbose(`AC request for ${hash}`);

    if (!result) {
      this.logger.verbose(`AC cache miss for ${hash}`);

      throw new RpcException({
        code: RpcStatusCode.NOT_FOUND,
        message: `Action result '${hash}' not found`
      });
    }

    this.logger.verbose(`AC cache hit for ${hash}`);
    return result;
  }

  @GrpcMethod('ActionCache', 'UpdateActionResult')
  updateActionResult(request: UpdateActionResultRequest): ActionResult {
    this.logger.verbose(`AC caching ${request.actionDigest.hash}`);

    if (!(request.actionDigest && request.actionResult)) {
      this.logger.error(`Missing action_digest or action_result for ${request.actionDigest.hash}`);

      throw new RpcException({
        code: RpcStatusCode.INVALID_ARGUMENT,
        message: 'Missing action_digest or action_result'
      });
    }

    this.persistenceService.persistActionResult(request.actionDigest.hash, request.actionResult);

    return request.actionResult;
  }

}
