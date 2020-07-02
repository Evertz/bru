import { Injectable, Provider } from '@nestjs/common';
import { join } from 'path';
import * as pb from 'protobufjs';

import { PROTO_ROOT } from '../grpc-otions';

@Injectable()
export abstract class BuildEventStreamProtoRoot extends pb.Root {}

export const BuildEventStreamProtoRootProvider: Provider = {
  provide: BuildEventStreamProtoRoot,
  useFactory: () => pb.loadSync(
    [
      'build_event_stream.proto',
      'command_line.proto',
      'invocation_policy.proto',
      'option_filters.proto'
    ].map(file => join(PROTO_ROOT, file))
  )
};
