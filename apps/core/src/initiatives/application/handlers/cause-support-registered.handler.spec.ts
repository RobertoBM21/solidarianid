import { UniqueEntityID } from '@app/shared/domain/entity';
import { Test, TestingModule } from '@nestjs/testing';
import { CauseSupportRegisteredEvent } from '../../domain/events/cause-support-registered.event';
import { CauseSupportRepository } from '../../domain/repositories/cause-support.repository';
import { CauseSupportRegisteredHandler } from './cause-support-registered.handler';

describe('CauseSupportRegisteredHandler', () => {
  let handler: CauseSupportRegisteredHandler;

  const mockCauseSupportRepository: jest.Mocked<
    Pick<CauseSupportRepository, 'save'>
  > = {
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CauseSupportRegisteredHandler,
        {
          provide: CauseSupportRepository,
          useValue: mockCauseSupportRepository,
        },
      ],
    }).compile();

    handler = module.get(CauseSupportRegisteredHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should persist a cause support for a user supporter', async () => {
    const causeId = UniqueEntityID.create();
    const supporterId = UniqueEntityID.create();
    const event = new CauseSupportRegisteredEvent(
      causeId.toString(),
      'user',
      supporterId.toString(),
    );
    mockCauseSupportRepository.save.mockResolvedValue();

    await handler.handle(event);

    expect(mockCauseSupportRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        props: expect.objectContaining({
          causeId,
        }),
      }),
    );
  });

  it('should persist a cause support for an anonymous supporter', async () => {
    const causeId = UniqueEntityID.create();
    const supporterId = UniqueEntityID.create();
    const event = new CauseSupportRegisteredEvent(
      causeId.toString(),
      'anonymous',
      supporterId.toString(),
    );
    mockCauseSupportRepository.save.mockResolvedValue();

    await handler.handle(event);

    expect(mockCauseSupportRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        props: expect.objectContaining({
          causeId,
        }),
      }),
    );
  });
});
