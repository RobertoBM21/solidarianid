import { UniqueEntityID } from '@app/shared/domain/entity';
import { Test, TestingModule } from '@nestjs/testing';
import { VolunteeringActionCreatedEvent } from '../../domain/events/volunteering-action-created.event';
import { ActionRepository } from '../../domain/repositories/action.repository';
import { VolunteeringActionCreatedHandler } from './volunteering-action-created.handler';

describe('VolunteeringActionCreatedHandler', () => {
  let handler: VolunteeringActionCreatedHandler;

  const mockActionRepository: jest.Mocked<Pick<ActionRepository, 'save'>> = {
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VolunteeringActionCreatedHandler,
        {
          provide: ActionRepository,
          useValue: mockActionRepository,
        },
      ],
    }).compile();

    handler = module.get(VolunteeringActionCreatedHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should persist a volunteering action from event', async () => {
    const actionId = UniqueEntityID.create();
    const causeId = UniqueEntityID.create();
    const event = new VolunteeringActionCreatedEvent(
      actionId.toString(),
      'Help event',
      'A valid description',
      ['Goal 1'],
      causeId.toString(),
      new Date('2026-05-01'),
      new Date('2026-06-01'),
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
