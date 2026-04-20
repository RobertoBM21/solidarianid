import { UniqueEntityID } from '@app/shared/domain';
import { CommunityProposalRejected } from '@app/shared/domain/events/community-proposal-rejected.event';
import { Test, TestingModule } from '@nestjs/testing';
import { CommunityProposalRepository } from '../../domain/repositories/community-proposal.repository';
import { CommunityProposalRejectedConsumer } from './community-proposal-rejected.consumer';

describe('CommunityProposalRejectedConsumer', () => {
  let consumer: CommunityProposalRejectedConsumer;

  const mockProposalRepository = {
    save: jest.fn(),
    findById: jest.fn(),
    remove: jest.fn(),
    updateAcceptedStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunityProposalRejectedConsumer,
        {
          provide: CommunityProposalRepository,
          useValue: mockProposalRepository,
        },
      ],
    }).compile();

    consumer = module.get<CommunityProposalRejectedConsumer>(
      CommunityProposalRejectedConsumer,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(consumer).toBeDefined();
  });

  it('should update proposal accepted status to false', async () => {
    const event: CommunityProposalRejected = {
      proposalId: UniqueEntityID.create().toString(),
      name: 'Rejected Community',
      description: 'Rejected Description',
      requesterId: UniqueEntityID.create().toString(),
      occurredOn: new Date(),
    };

    await consumer.handleCommunityProposalRejected(event);

    expect(mockProposalRepository.updateAcceptedStatus).toHaveBeenCalledWith(
      event.proposalId,
      false,
    );
  });
});
