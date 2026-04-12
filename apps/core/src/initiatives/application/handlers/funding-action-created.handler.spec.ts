import { UniqueEntityID } from '@app/shared/domain/entity';
import { Test, TestingModule } from '@nestjs/testing';
import { FundingActionCreatedEvent } from '../../domain/events/funding-action-created.event';
import { ActionRepository } from '../../domain/repositories/action.repository';
import { FundingActionCreatedHandler } from './funding-action-created.handler';

describe('FundingActionCreatedHandler', () => {
  let handler: FundingActionCreatedHandler;

  const mockActionRepository: jest.Mocked<Pick<ActionRepository, 'save'>> = {
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FundingActionCreatedHandler,
        {
          provide: ActionRepository,
          useValue: mockActionRepository,
        },
      ],
    }).compile();

    handler = module.get(FundingActionCreatedHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should persist a funding action from event', async () => {
    const actionId = UniqueEntityID.create();
    const causeId = UniqueEntityID.create();
    const event = new FundingActionCreatedEvent(
      actionId.toString(),
      'Fundraiser',
      'A valid description',
      ['Goal 1'],
      causeId.toString(),
      5000,
    );
    mockActionRepository.save.mockResolvedValue();

    await handler.handle(event);

    expect(mockActionRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: actionId,
        props: expect.objectContaining({
          causeId,
        }),
      }),
    );
  });
});
