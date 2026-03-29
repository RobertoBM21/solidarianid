import { UniqueEntityID } from '@app/shared/domain';
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager, type ObjectLiteral } from 'typeorm';
import { VolunteerLog } from '../../../domain/aggregates/volunteer-log.aggregate';
import { VolunteerLogNotFoundError } from '../../../domain/repositories/volunteer-log.repository';
import { VolunteerLogDbEntity } from '../entities/volunteer-log.db-entity';
import { VolunteerLogRepositoryImpl } from './volunteer-log.repository.impl';

describe('VolunteerLogRepositoryImpl', () => {
  let repository: VolunteerLogRepositoryImpl;

  const mockEntityManager: jest.Mocked<
    Pick<EntityManager, 'save' | 'findOne' | 'delete'>
  > = {
    save: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const volunteerId = UniqueEntityID.create().toString();
  const actionId = UniqueEntityID.create().toString();
  const logId = UniqueEntityID.create().toString();

  const startDate = new Date('2026-01-01T10:00:00Z');
  const endDate = new Date('2026-01-01T12:00:00Z');

  const sampleEntity: ObjectLiteral = {
    id: logId,
    userId: volunteerId,
    actionId: actionId,
    start: startDate,
    end: endDate,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VolunteerLogRepositoryImpl,
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        },
      ],
    }).compile();

    repository = module.get(VolunteerLogRepositoryImpl);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('save', () => {
    it('should save a volunteer log using entity manager', async () => {
      const volunteerLog = VolunteerLog.create({
        volunteerId: volunteerId,
        volunteeringActionId: actionId,
        start: startDate,
        end: endDate,
      }).value as VolunteerLog;

      await repository.save(volunteerLog);

      expect(mockEntityManager.save).toHaveBeenCalledWith(
        VolunteerLogDbEntity,
        expect.objectContaining({
          id: expect.any(String),
          userId: volunteerId,
          actionId: actionId,
          start: startDate,
          end: endDate,
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return VolunteerLog on findById', async () => {
      mockEntityManager.findOne.mockResolvedValue(sampleEntity);

      const result = await repository.findById(UniqueEntityID.create(logId));

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.id.toString()).toBe(logId);
        expect(result.value.start).toEqual(startDate);
      }
      expect(mockEntityManager.findOne).toHaveBeenCalledWith(
        VolunteerLogDbEntity,
        { where: { id: logId } },
      );
    });

    it('should return Left(VolunteerLogNotFoundError) if log not found', async () => {
      mockEntityManager.findOne.mockResolvedValue(null);

      const result = await repository.findById(UniqueEntityID.create(logId));

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(VolunteerLogNotFoundError);
    });
  });
});
