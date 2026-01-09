import { QueryHandler } from '@nestjs/cqrs';
import { UserRepository } from '../../domain/repositories/user.repository';
import { GetUserExistsQuery } from '../queries/get-user-exists.query';

@QueryHandler(GetUserExistsQuery)
export class GetUserExistsHandler {
  constructor(private readonly repository: UserRepository) {}

  async execute(query: GetUserExistsQuery): Promise<boolean> {
    const result = await this.repository.findById(query.userId);
    return result.isRight();
  }
}
