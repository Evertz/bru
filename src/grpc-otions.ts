import { ClientOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

export const PROTO_ROOT = join(__dirname, '..', '..', 'src', 'proto');

export const GRPC_OPTIONS: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    url: 'localhost:5000',
    package: [
      'build_event_stream',
      'google.devtools.build.v1',
      'command_line',
      'blaze.invocation_policy',
      'options',
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
      'publish_build_event.proto'
    ].map(file => join(PROTO_ROOT, file))
  },
};
