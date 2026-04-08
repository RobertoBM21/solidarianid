import { DataSource, Repository } from 'typeorm';
import { CauseDbEntity } from '../../../src/communities/infrastructure/persistence/entities/cause.db-entity';
import { CauseAggrDbEntity } from '../../../src/initiatives/infrastructure/persistence/entities/cause-aggr.db-entity';

export class CauseTestFactory {
  private repository: Repository<CauseDbEntity>;
  private aggrRepository: Repository<CauseAggrDbEntity>;

  constructor(private dataSource: DataSource) {
    this.repository = dataSource.getRepository(CauseDbEntity);
    this.aggrRepository = dataSource.getRepository(CauseAggrDbEntity);
  }

  async create(overrides: Partial<CauseDbEntity> = {}): Promise<CauseDbEntity> {
    const causeData = this.repository.create({
      id: overrides.id ?? crypto.randomUUID(),
      title: overrides.title ?? 'Test Cause',
      description: overrides.description ?? 'A cause for testing purposes',
      duration: overrides.duration ?? '3 months',
      ods: overrides.ods ?? 3,
      createdAt: overrides.createdAt ?? new Date(),
      communityId: overrides.communityId ?? crypto.randomUUID(),
    });

    const aggrData = this.aggrRepository.create({
      id: causeData.id,
      communityId: causeData.communityId,
    });

    return this.dataSource.transaction(async (manager) => {
      const savedCause = await manager.save(CauseDbEntity, causeData);
      await manager.save(CauseAggrDbEntity, aggrData);
      return savedCause;
    });
  }
}
