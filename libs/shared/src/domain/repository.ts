import { Entity, UniqueEntityID } from './entity';
import { DomainError, Either } from './errors';

export abstract class Repository<
  T extends Entity<unknown>,
  E extends DomainError,
> {
  abstract save(obj: T): Promise<void>;

  abstract findById(id: UniqueEntityID): Promise<Either<E, T>>;

  abstract remove(id: UniqueEntityID): Promise<Either<E, void>>;
}
