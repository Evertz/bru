import { Global, Module, Provider } from '@nestjs/common';

import { RegisteredHandlers } from './handlers/bep-handler';
import { BuildEventStreamProtoRootProvider } from './build-event-stream-proto-root';
import { BesController } from './bes.controller';
import { DefaultBepHandler } from './handlers/default-bep-handler';

const Handlers = [
  DefaultBepHandler
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
