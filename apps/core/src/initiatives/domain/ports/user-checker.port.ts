import { UniqueEntityID } from '@app/shared/domain';

export abstract class UserCheckerPort {
  abstract userExists(userId: UniqueEntityID): Promise<boolean>;
}
