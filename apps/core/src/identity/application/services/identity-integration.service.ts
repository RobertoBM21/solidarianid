import { UniqueEntityID } from '@app/shared/domain';
import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class IdentityIntegrationService {
  constructor(private readonly userRepo: UserRepository) {}

  async userExists(userId: UniqueEntityID): Promise<boolean> {
    const result = await this.userRepo.findById(userId);
    return result.isRight();
  }
}
