import { UniqueEntityID } from '@app/shared/domain';
import { Test, TestingModule } from '@nestjs/testing';
import { CauseClosedEvent } from '../../../communities/domain/events/cause-closed.event';
import { VolunteeringAction } from '../../domain/aggregates/volunteering-action.aggregate';
import { VolunteeringActionRepository } from '../../domain/repositories/volunteering-action.repository';
import { VolunteeringCauseClosedHandler } from './cause-closed.handler';

const CAUSE_ID = UniqueEntityID.create().toString();

const makeAction = (closed = false) =>
  VolunteeringAction.create({
    title: 'Action',
    causeId: CAUSE_ID,
    closed,
  }).value as VolunteeringAction;

describe('VolunteeringCauseClosedHandler', () => {
  let handler: VolunteeringCauseClosedHandler;
  let repo: jest.Mocked<
    Pick<VolunteeringActionRepository, 'findAllByCauseId' | 'save'>
  >;

  beforeEach(async () => {
    repo = {
      findAllByCauseId: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VolunteeringCauseClosedHandler,
        { provide: VolunteeringActionRepository, useValue: repo },
      ],
    }).compile();

    handler = module.get(VolunteeringCauseClosedHandler);
  });

  afterEach(jest.clearAllMocks);

  it('should close all open actions for the cause', async () => {
    const action1 = makeAction();
    const action2 = makeAction();
    repo.findAllByCauseId.mockResolvedValue([action1, action2]);

    await handler.handle(new CauseClosedEvent(CAUSE_ID));

    expect(action1.closed).toBe(true);
    expect(action2.closed).toBe(true);
    expect(repo.save).toHaveBeenCalledTimes(2);
    expect(repo.save).toHaveBeenCalledWith(action1);
    expect(repo.save).toHaveBeenCalledWith(action2);
  });

  it('should handle no actions gracefully', async () => {
    repo.findAllByCauseId.mockResolvedValue([]);

    await handler.handle(new CauseClosedEvent(CAUSE_ID));

    expect(repo.save).not.toHaveBeenCalled();
  });
});
