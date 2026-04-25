import { KurrentDBClient } from '@kurrent/kurrentdb-client';
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from 'typeorm';
import { CauseClosedEvent } from '../../../communities/domain/events/cause-closed.event';
import { FundingActionCreatedEvent } from '../../../initiatives/domain/events/funding-action-created.event';
import { FundingActionDbEntity } from '../../../initiatives/infrastructure/persistence/entities/funding-action.db-entity';
import { DONATION_PROCESSED } from '../../domain/events/donation-processed.event';
import { KURRENTDB_CLIENT } from '../config/kurrentdb.config';
import { FundingActionAggrDbEntity } from '../persistence/entities/funding-action-aggr.db-entity';
import { FundingActionProjector } from './funding-action.projector';

const ACTION_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const CAUSE_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12';
const DONOR_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13';
const DONATION_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14';

function makeSubscription(
  events: {
    event: { type: string; id: string; data: Record<string, unknown> };
    commitPosition?: bigint;
  }[],
): ReturnType<KurrentDBClient['subscribeToAll']> {
  let i = 0;
  return {
    [Symbol.asyncIterator]() {
      return this;
    },
    next() {
      if (i < events.length)
        return Promise.resolve({ value: events[i++], done: false as const });
      return Promise.resolve({
        value: undefined as unknown as (typeof events)[number],
        done: true as const,
      });
    },
  } as unknown as ReturnType<KurrentDBClient['subscribeToAll']>;
}

describe('FundingActionProjector', () => {
  let projector: FundingActionProjector;
  let mockClient: jest.Mocked<Pick<KurrentDBClient, 'subscribeToAll'>>;
  let mockEm: {
    upsert: jest.Mock;
    increment: jest.Mock;
    update: jest.Mock;
    findOne: jest.Mock;
  };

  beforeEach(async () => {
    mockEm = {
      upsert: jest.fn().mockResolvedValue(undefined),
      increment: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue(undefined),
      findOne: jest.fn().mockResolvedValue(null),
    };

    mockClient = {
      subscribeToAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FundingActionProjector,
        { provide: KURRENTDB_CLIENT, useValue: mockClient },
        { provide: EntityManager, useValue: mockEm },
      ],
    }).compile();

    projector = module.get(FundingActionProjector);
  });

  afterEach(jest.clearAllMocks);

  describe('FundingActionCreatedEvent event', () => {
    it('should upsert a new read model entry', async () => {
      const events = [
        {
          event: {
            type: FundingActionCreatedEvent.name,
            id: 'evt-1',
            data: {
              actionId: ACTION_ID,
              title: 'Help Schools',
              causeId: CAUSE_ID,
            },
          },
        },
      ];
      mockClient.subscribeToAll.mockReturnValue(makeSubscription(events));

      projector.onModuleInit();
      await new Promise((r) => setImmediate(r));

      expect(mockEm.upsert).toHaveBeenCalledWith(
        FundingActionAggrDbEntity,
        expect.objectContaining({
          id: ACTION_ID,
          title: 'Help Schools',
          causeId: CAUSE_ID,
          closed: false,
          currentAmount: 0,
        }),
        ['id'],
      );
    });
  });

  describe('DonationProcessed event', () => {
    it('should increment current_amount in the read model', async () => {
      const events = [
        {
          event: {
            type: DONATION_PROCESSED,
            id: 'evt-2',
            data: {
              actionId: ACTION_ID,
              donationId: DONATION_ID,
              donorId: DONOR_ID,
              amount: 50,
              externalPaymentId: 'cs_test_1',
              processedAt: new Date().toISOString(),
            },
          },
        },
      ];
      mockClient.subscribeToAll.mockReturnValue(makeSubscription(events));

      projector.onModuleInit();
      await new Promise((r) => setImmediate(r));

      expect(mockEm.increment).toHaveBeenCalledWith(
        FundingActionAggrDbEntity,
        { id: ACTION_ID },
        'currentAmount',
        50,
      );
      expect(mockEm.increment).toHaveBeenCalledWith(
        FundingActionDbEntity,
        { id: ACTION_ID },
        'currentAmount',
        50,
      );
    });

    it('should log a warning when actionId is missing', async () => {
      const events = [
        {
          event: {
            type: DONATION_PROCESSED,
            id: 'evt-3',
            data: { amount: 50 },
          },
        },
      ];
      mockClient.subscribeToAll.mockReturnValue(makeSubscription(events));

      projector.onModuleInit();
      await new Promise((r) => setImmediate(r));

      expect(mockEm.increment).not.toHaveBeenCalled();
    });
  });

  describe('CauseClosedEvent event', () => {
    it('should set closed=true in the read model', async () => {
      const events = [
        {
          event: {
            type: CauseClosedEvent.name,
            id: 'evt-4',
            data: {
              actionId: ACTION_ID,
              causeId: CAUSE_ID,
            },
          },
        },
      ];
      mockClient.subscribeToAll.mockReturnValue(makeSubscription(events));

      projector.onModuleInit();
      await new Promise((r) => setImmediate(r));

      expect(mockEm.update).toHaveBeenCalledWith(
        FundingActionAggrDbEntity,
        { id: ACTION_ID },
        { closed: true },
      );
      expect(mockEm.update).toHaveBeenCalledWith(
        FundingActionDbEntity,
        { id: ACTION_ID },
        { closed: true },
      );
    });

    it('should log a warning when actionId is missing', async () => {
      const events = [
        {
          event: {
            type: CauseClosedEvent.name,
            id: 'evt-5',
            data: { causeId: CAUSE_ID },
          },
        },
      ];
      mockClient.subscribeToAll.mockReturnValue(makeSubscription(events));

      projector.onModuleInit();
      await new Promise((r) => setImmediate(r));

      expect(mockEm.update).not.toHaveBeenCalled();
    });
  });

  describe('unknown event types', () => {
    it('should silently ignore unknown event types', async () => {
      const events = [
        {
          event: {
            type: 'SomeOtherEvent',
            id: 'evt-6',
            data: {},
          },
        },
      ];
      mockClient.subscribeToAll.mockReturnValue(makeSubscription(events));

      projector.onModuleInit();
      await new Promise((r) => setImmediate(r));

      expect(mockEm.upsert).not.toHaveBeenCalledWith(
        FundingActionAggrDbEntity,
        expect.anything(),
        expect.anything(),
      );
      expect(mockEm.increment).not.toHaveBeenCalled();
      expect(mockEm.update).not.toHaveBeenCalled();
    });
  });

  describe('checkpoint management', () => {
    it('should resume from saved checkpoint on startup', async () => {
      const savedPosition = '5';
      mockEm.findOne.mockResolvedValueOnce({
        name: 'funding-action-projector',
        position: savedPosition,
      });
      mockClient.subscribeToAll.mockReturnValue(makeSubscription([]));

      projector.onModuleInit();
      await new Promise((r) => setImmediate(r));

      expect(mockClient.subscribeToAll).toHaveBeenCalledWith(
        expect.objectContaining({
          fromPosition: { commit: 5n, prepare: 5n },
        }),
      );
    });

    it('should start from the beginning when no checkpoint exists', async () => {
      mockEm.findOne.mockResolvedValueOnce(null);
      mockClient.subscribeToAll.mockReturnValue(makeSubscription([]));

      projector.onModuleInit();
      await new Promise((r) => setImmediate(r));

      expect(mockClient.subscribeToAll).toHaveBeenCalledWith(
        expect.objectContaining({
          fromPosition: 'start',
        }),
      );
    });
  });
});
