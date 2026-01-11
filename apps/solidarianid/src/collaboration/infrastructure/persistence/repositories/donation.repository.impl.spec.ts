import { UniqueEntityID } from '@app/shared/domain';
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager, type ObjectLiteral } from 'typeorm';
import { Donation } from '../../../domain/aggregates/donation.aggregate';
import { DonationNotFoundError } from '../../../domain/repositories/donation.repository';
import { DonationDbEntity } from '../entities/donation.db-entity';
import { DonationRepositoryImpl } from './donation.repository.impl';

describe('DonationRepositoryImpl', () => {
  let repo: DonationRepositoryImpl;

  const mockEntityManager: jest.Mocked<
    Pick<
      EntityManager,
      | 'save'
      | 'findOne'
      | 'find'
      | 'delete'
      | 'findOneBy'
      | 'createQueryBuilder'
    >
  > = {
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
    findOneBy: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const donationId = UniqueEntityID.create().toString();
  const donorId = UniqueEntityID.create().toString();
  const actionId = UniqueEntityID.create().toString();

  const sampleEntity: ObjectLiteral = {
    id: donationId,
    userId: donorId,
    actionId: actionId,
    amount: 100,
    created_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DonationRepositoryImpl,
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        },
      ],
    }).compile();

    repo = module.get(DonationRepositoryImpl);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should save a donation using entity manager', async () => {
    const donation = Donation.create({
      donorId,
      fundingActionId: actionId,
      amount: 100,
    }).value as Donation;

    await repo.save(donation);

    expect(mockEntityManager.save).toHaveBeenCalledWith(
      DonationDbEntity,
      expect.objectContaining({
        id: expect.any(String),
        userId: donorId,
        actionId: actionId,
        amount: 100,
      }),
    );
  });

  it('should return Donation on findById', async () => {
    mockEntityManager.findOne.mockResolvedValue(sampleEntity);

    const result = await repo.findById(UniqueEntityID.create(donationId));

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.id.toString()).toBe(donationId);
      expect(result.value.amount).toBe(100);
    }
    expect(mockEntityManager.findOne).toHaveBeenCalledWith(DonationDbEntity, {
      where: { id: donationId },
    });
  });

  it('should return left on findById when not found', async () => {
    mockEntityManager.findOne.mockResolvedValue(null);

    const result = await repo.findById(UniqueEntityID.create(donationId));

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(DonationNotFoundError);
    }
    expect(mockEntityManager.findOne).toHaveBeenCalledWith(DonationDbEntity, {
      where: { id: donationId },
    });
  });

  it('should return all donations sum', async () => {
    mockEntityManager.createQueryBuilder = jest.fn().mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ total: '250.50' }),
    } as any);

    const total = await repo.getTotalDonationsAmount();

    expect(total).toBe(250.5);
    expect(mockEntityManager.createQueryBuilder).toHaveBeenCalledWith(
      DonationDbEntity,
      'donations',
    );
  });

  it('should return zero when there are no donations', async () => {
    mockEntityManager.createQueryBuilder = jest.fn().mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ total: null }),
    } as any);

    const total = await repo.getTotalDonationsAmount();

    expect(total).toBe(0);
    expect(mockEntityManager.createQueryBuilder).toHaveBeenCalledWith(
      DonationDbEntity,
      'donations',
    );
  });
});
