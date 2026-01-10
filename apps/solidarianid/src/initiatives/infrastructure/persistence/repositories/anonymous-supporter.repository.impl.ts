import { Either, right, UniqueEntityID } from '@app/shared/domain';
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import {
  AnonymousSupporterError,
  AnonymousSupporterRepository,
} from '../../../domain/repositories/anonymous-supporter.repository';
import { AnonymousUserDbEntity } from '../entities/anonymous-user.db-entity';

@Injectable()
export class AnonymousSupporterRepositoryImpl implements AnonymousSupporterRepository {
  constructor(private readonly em: EntityManager) {}

  async getOrCreate(
    name: string,
    email: string,
  ): Promise<Either<AnonymousSupporterError, UniqueEntityID>> {
    const newId = UniqueEntityID.create().toString();
    const result = await this.em.upsert(
      AnonymousUserDbEntity,
      { id: newId, name, email },
      ['email'],
    );
    const persistedId = result.identifiers[0].id as string;
    return right(UniqueEntityID.create(persistedId));
  }
}
