import { Module } from '@nestjs/common';
import { ApplicationModule } from '../application/application.module';
import { CommunitiesController } from './controllers/communities.controller';

@Module({
  imports: [ApplicationModule],
  controllers: [CommunitiesController],
})
export class PresentationModule {}
