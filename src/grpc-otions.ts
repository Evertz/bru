import { ClientOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

export const PROTO_ROOT = join(process.cwd(), 'src', 'proto');

export const GRPC_OPTIONS: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    url: '0.0.0.0:5000',
    maxReceiveMessageLength: 1024 * 1024 * 50,
    maxSendMessageLength: 1024 * 1024 * 50,
    loader: {
      includeDirs: [PROTO_ROOT]
    },
    package: [
      "build.bazel.remote.execution.v2",
      'build_event_stream',
      'build.bazel.semver',
      'google.devtools.build.v1',
      'google.bytestream',
      'command_line',
      'blaze.invocation_policy',
      'options'
    ],
    protoPath: [
      'build_event_stream.proto',
      'build_events.proto',
      'build_status.proto',
      'command_line.proto',
      'invocation_policy.proto',
      'option_filters.proto',
      'duration.proto',
      'empty.proto',
      'publish_build_event.proto',
      'remote_execution.proto',
      'semver.proto',
      'google/bytestream/bytestream.proto'
    ].map(file => join(PROTO_ROOT, file))
  },
};
