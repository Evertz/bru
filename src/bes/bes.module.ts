import { Global, Module, Provider } from '@nestjs/common';

import { RegisteredHandlers } from './handlers/invocation-handler';
import { BuildEventStreamProtoRootProvider } from './build-event-stream-proto-root';
import { BesController } from './bes.controller';
import { DefaultInvocationHandler } from './handlers/default-invocation-handler.service';

const Handlers = [
  DefaultInvocationHandler
];

const HandlersProvider: Provider = {
  provide: RegisteredHandlers,
  useFactory: (...args) => args,
  inject: Handlers
};

@Global()
@Module({
  controllers: [BesController],
  providers: [
    ...Handlers,
    HandlersProvider,
    BuildEventStreamProtoRootProvider
  ],
  exports: [
    ...Handlers
  ]
})
export class BesModule {}
