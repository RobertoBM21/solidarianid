import { ProfileOutDto } from '@app/shared/application/dtos/profile-out.dto';
import { Injectable } from '@nestjs/common';
import { UserPort } from '../application/ports/user.port';
import { UserRepository } from '../domain/repositories/user.repository';

@Injectable()
export class IdentityIntegrationService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly userPort: UserPort,
  ) {}

  async getUser(userId: string): Promise<ProfileOutDto | null> {
    const result = await this.userPort.getProfile(userId);
    if (result.isLeft()) {
      return null;
    }
    return result.value;
  }
}
