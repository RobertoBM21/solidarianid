import {
  DomainError,
  Either,
  Entity,
  left,
  Repository,
  right,
  UniqueEntityID,
} from '@app/shared/domain';
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

@Injectable()
// eslint-disable-next-line @darraghor/nestjs-typed/injectable-should-be-provided
export abstract class AbstractTypeormRepository<
  T extends Entity<unknown>,
  E extends DomainError,
  DbE extends { id: string },
> implements Repository<T, E>
{
  protected abstract readonly dbEntityClass: new () => DbE;
  protected abstract readonly notFoundErrorClass: new (id: string) => E;

  constructor(protected readonly em: EntityManager) {}

  async save(item: T): Promise<void> {
    const entity = this.mapFromDomain(item);
    await this.em.save(this.dbEntityClass, entity);
  }

  async findById(id: UniqueEntityID): Promise<Either<E, T>> {
    const entity = await this.em.findOne(this.dbEntityClass, {
      // @ts-expect-error TypeORM typing issue with our generic DbE
      where: { id: id.toString() },
    });
    if (!entity) {
      return left(new this.notFoundErrorClass(id.toString()));
    }
    return right(this.mapToDomain(entity));
  }

  async remove(id: UniqueEntityID): Promise<Either<E, void>> {
    const result = await this.em.delete(this.dbEntityClass, {
      id: id.toString(),
    });
    if (result.affected === 0) {
      return left(new this.notFoundErrorClass(id.toString()));
    }
    return right(undefined);
  }

  protected abstract mapFromDomain(item: T): DbE;
  protected abstract mapToDomain(entity: DbE): T;
}
