import { right } from '@app/shared/domain';
import { UniqueEntityID } from '@app/shared/domain/entity';
import { Test, TestingModule } from '@nestjs/testing';
import { CauseClosedEvent } from '../../../communities/domain/events/cause-closed.event';
import { CauseAggr } from '../../domain/aggregates/cause.aggregate';
import { CauseAggrRepository } from '../../domain/repositories/cause-aggr.repository';
import { CauseClosedHandler } from './cause-closed.handler';

describe('CauseClosedHandler', () => {
  let handler: CauseClosedHandler;

  const mockCauseAggrRepository: jest.Mocked<
    Pick<CauseAggrRepository, 'findById' | 'save'>
  > = {
    findById: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CauseClosedHandler,
        {
          provide: CauseAggrRepository,
          useValue: mockCauseAggrRepository,
        },
      ],
    }).compile();

    handler = module.get(CauseClosedHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle cause closed event', async () => {
    const causeId = UniqueEntityID.create();
    const communityId = UniqueEntityID.create();
    const event = new CauseClosedEvent(
      causeId.toString(),
      communityId.toString(),
    );

    const causeAggr = CauseAggr.create({
      id: causeId.toString(),
      title: 'Test Cause',
      closed: false,
      communityId: communityId.toString(),
    }).value as CauseAggr;

    mockCauseAggrRepository.findById.mockResolvedValue(right(causeAggr));
    mockCauseAggrRepository.save.mockResolvedValue();

    await handler.handle(event);

    expect(mockCauseAggrRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: causeId,
        props: expect.objectContaining({
          communityId: communityId,
        }),
      }),
    );
  });
});
