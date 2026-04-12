import { UniqueEntityID } from '@app/shared/domain';
import { Injectable } from '@nestjs/common';
import { IdentityIntegrationService } from '../../identity/application/services/identity-integration.service';
import { UserCheckerPort } from '../domain/ports/user-checker.port';

@Injectable()
export class IdentityIntegrationAdapter implements UserCheckerPort {
  constructor(private readonly integrationApi: IdentityIntegrationService) {}

  userExists(userId: UniqueEntityID): Promise<boolean> {
    return this.integrationApi.userExists(userId);
  }
}
