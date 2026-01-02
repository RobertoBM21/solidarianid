import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { CommunitiesService } from './services/communities.service';

@Module({
  imports: [InfrastructureModule],
  providers: [CommunitiesService],
  exports: [CommunitiesService],
})
export class ApplicationModule {}
