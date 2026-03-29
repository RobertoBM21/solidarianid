import { DomainError, Either, UniqueEntityID } from '@app/shared/domain';

export class AnonymousSupporterError implements DomainError {
  message = 'Error creating or retrieving anonymous supporter';
}

export abstract class AnonymousSupporterRepository {
  abstract getOrCreate(
    name: string,
    email: string,
  ): Promise<Either<AnonymousSupporterError, UniqueEntityID>>;
}
