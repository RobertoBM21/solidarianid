import { ProfileOutDto } from '@app/shared/application/dtos/profile-out.dto';
import { Injectable } from '@nestjs/common';
import { IdentityIntegrationService } from '../../identity/infrastructure/identity-integration.service';
import { GetUserPort } from '../application/ports/get-user.port';

@Injectable()
export class GetUserIntegrationAdapter implements GetUserPort {
  constructor(private readonly integrationApi: IdentityIntegrationService) {}

  getUser(userId: string): Promise<ProfileOutDto | null> {
    return this.integrationApi.getUser(userId);
  }
}
