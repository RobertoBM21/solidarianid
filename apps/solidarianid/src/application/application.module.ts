import { Module } from '@nestjs/common';
import { CausesServicePort } from '../domain/ports/causes.service.port';
import { UserPort } from '../domain/ports/user.port';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { CausesService } from './services/causes.service';
import { CommunitiesService } from './services/communities.service';
import { UserService } from './services/user.service';

@Module({
  imports: [InfrastructureModule],
  providers: [
    CommunitiesService,
    CausesService,
    {
      provide: CausesServicePort,
      useExisting: CausesService,
    },
    UserService,
    {
      provide: UserPort,
      useExisting: UserService,
    },
  ],
  exports: [CommunitiesService, CausesServicePort, UserPort],
})
export class ApplicationModule {}
