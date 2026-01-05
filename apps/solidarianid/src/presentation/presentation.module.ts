import { Module } from '@nestjs/common';
import { ApplicationModule } from '../application/application.module';
import { AppController } from './controllers/app.controller';
import { CausesController } from './controllers/causes.controller';
import { CommunitiesController } from './controllers/communities.controller';

@Module({
  imports: [ApplicationModule],
  controllers: [AppController, CommunitiesController, CausesController],
})
export class PresentationModule {}
