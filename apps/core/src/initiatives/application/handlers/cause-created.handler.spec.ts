import { UniqueEntityID } from '@app/shared/domain/entity';
import { Test, TestingModule } from '@nestjs/testing';
import { CauseCreatedEvent } from '../../../communities/domain/events/cause-created.event';
import { CauseAggrRepository } from '../../domain/repositories/cause-aggr.repository';
import { CauseCreatedHandler } from './cause-created.handler';

describe('CauseCreatedHandler', () => {
  let handler: CauseCreatedHandler;

  const mockCauseAggrRepository: jest.Mocked<
    Pick<CauseAggrRepository, 'save'>
  > = {
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CauseCreatedHandler,
        {
          provide: CauseAggrRepository,
          useValue: mockCauseAggrRepository,
        },
      ],
    }).compile();

    handler = module.get(CauseCreatedHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle cause created event', async () => {
    const causeId = UniqueEntityID.create();
    const communityId = UniqueEntityID.create();
    const event = new CauseCreatedEvent(
      causeId.toString(),
      communityId.toString(),
    );
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
