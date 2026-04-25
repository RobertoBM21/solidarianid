import { UniqueEntityID } from '@app/shared/domain';
import {
  KurrentDBClient,
  WrongExpectedVersionError,
} from '@kurrent/kurrentdb-client';
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from 'typeorm';
import { CauseClosedEvent } from '../../../../communities/domain/events/cause-closed.event';
import { FundingActionCreatedEvent } from '../../../../initiatives/domain/events/funding-action-created.event';
import { FundingAction } from '../../../domain/aggregates/funding-action.aggregate';
import { DONATION_PROCESSED } from '../../../domain/events/donation-processed.event';
import { KURRENTDB_CLIENT } from '../../config/kurrentdb.config';
import {
  FundingActionConcurrencyError,
  FundingActionEventStoreRepository,
} from './funding-action-eventstore.repository';

const ACTION_ID = UniqueEntityID.create().toString();
const CAUSE_ID = UniqueEntityID.create().toString();
const DONOR_ID = UniqueEntityID.create().toString();
const DONATION_ID = UniqueEntityID.create().toString();

const makeOpenAction = () =>
  FundingAction.create({ title: 'Test Action', causeId: CAUSE_ID })
    .value as FundingAction;

function makeReadStream(
  events: { type: string; data: Record<string, unknown>; revision: bigint }[],
): ReturnType<KurrentDBClient['readStream']> {
  let i = 0;
  return {
    [Symbol.asyncIterator]() {
      return this;
    },
    next() {
      if (i < events.length) {
        const ev = events[i++];
        return Promise.resolve({
          value: { event: ev },
          done: false as const,
        });
      }
      return Promise.resolve({
        value: undefined as unknown as { event: (typeof events)[number] },
        done: true as const,
      });
    },
  } as unknown as ReturnType<KurrentDBClient['readStream']>;
}

describe('FundingActionEventStoreRepository', () => {
  let repo: FundingActionEventStoreRepository;
  let mockClient: jest.Mocked<
    Pick<KurrentDBClient, 'appendToStream' | 'readStream'>
  >;
  let mockEm: jest.Mocked<Pick<EntityManager, 'find'>>;

  beforeEach(async () => {
    mockClient = {
      appendToStream: jest.fn(),
      readStream: jest.fn(),
    };

    mockEm = {
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FundingActionEventStoreRepository,
        { provide: KURRENTDB_CLIENT, useValue: mockClient },
        { provide: EntityManager, useValue: mockEm },
      ],
    }).compile();

    repo = module.get(FundingActionEventStoreRepository);
  });

  afterEach(jest.clearAllMocks);

  describe('save()', () => {
    it('should append pending events to the stream', async () => {
      const action = makeOpenAction();
      mockClient.appendToStream.mockResolvedValue({
        success: true,
      } as unknown as Awaited<ReturnType<KurrentDBClient['appendToStream']>>);

      await repo.save(action);

      expect(mockClient.appendToStream).toHaveBeenCalledWith(
        `funding-action-${action.id.toString()}`,
        expect.arrayContaining([expect.anything()]),
        { streamState: 'no_stream' },
      );
      expect(action.pullDomainEvents()).toHaveLength(0);
    });

    it('should skip appendToStream when there are no pending events', async () => {
      const action = makeOpenAction();
      action.pullDomainEvents();

      await repo.save(action);

      expect(mockClient.appendToStream).not.toHaveBeenCalled();
    });

    it('should throw FundingActionConcurrencyError on WrongExpectedVersionError', async () => {
      const action = makeOpenAction();
      mockClient.appendToStream.mockRejectedValue(
        Object.create(WrongExpectedVersionError.prototype),
      );

      await expect(repo.save(action)).rejects.toBeInstanceOf(
        FundingActionConcurrencyError,
      );
    });

    it('should rethrow non-concurrency errors', async () => {
      const action = makeOpenAction();
      mockClient.appendToStream.mockRejectedValue(new Error('Network error'));

      await expect(repo.save(action)).rejects.toThrow('Network error');
    });
  });

  describe('optimistic concurrency', () => {
    it('two concurrent save() on the same stream should fail on the second with FundingActionConcurrencyError', async () => {
      const action = makeOpenAction();

      mockClient.appendToStream
        .mockResolvedValueOnce({ success: true } as unknown as Awaited<
          ReturnType<KurrentDBClient['appendToStream']>
        >)
        .mockRejectedValueOnce(
          Object.create(WrongExpectedVersionError.prototype),
        );

      const secondAction = makeOpenAction();

      await expect(
        Promise.all([repo.save(action), repo.save(secondAction)]),
      ).rejects.toBeInstanceOf(FundingActionConcurrencyError);
    });
  });

  describe('findById()', () => {
    it('should reconstitute a FundingAction from stream events', async () => {
      const events = [
        {
          type: FundingActionCreatedEvent.name,
          data: {
            actionId: ACTION_ID,
            title: 'Test Action',
            causeId: CAUSE_ID,
          },
          revision: 0n,
        },
        {
          type: DONATION_PROCESSED,
          data: {
            actionId: ACTION_ID,
            donationId: DONATION_ID,
            donorId: DONOR_ID,
            amount: 100,
            externalPaymentId: 'cs_test_1',
            processedAt: new Date().toISOString(),
          },
          revision: 1n,
        },
      ];
      mockClient.readStream.mockReturnValue(makeReadStream(events));

      const result = await repo.findById(UniqueEntityID.create(ACTION_ID));

      expect(result.isRight()).toBe(true);
      const action = result.value as FundingAction;
      expect(action.title).toBe('Test Action');
      expect(action.currentAmountValue).toBe(100);
      expect(action.closed).toBe(false);
      expect(action.version).toBe(1n);
    });

    it('should return FundingActionNotFoundError when stream has no recognised events', async () => {
      mockClient.readStream.mockReturnValue(makeReadStream([]));

      const result = await repo.findById(UniqueEntityID.create(ACTION_ID));

      expect(result.isLeft()).toBe(true);
    });

    it('should return FundingActionNotFoundError on StreamNotFoundError', async () => {
      const { StreamNotFoundError } = jest.requireActual<
        typeof import('@kurrent/kurrentdb-client')
      >('@kurrent/kurrentdb-client');
      mockClient.readStream.mockImplementation(() => {
        throw new StreamNotFoundError();
      });

      const result = await repo.findById(UniqueEntityID.create(ACTION_ID));

      expect(result.isLeft()).toBe(true);
    });

    it('should correctly apply FundingActionClosed event', async () => {
      const events = [
        {
          type: FundingActionCreatedEvent.name,
          data: {
            actionId: ACTION_ID,
            title: 'Test Action',
            causeId: CAUSE_ID,
          },
          revision: 0n,
        },
        {
          type: CauseClosedEvent.name,
          data: { causeId: CAUSE_ID },
          revision: 1n,
        },
      ];
      mockClient.readStream.mockReturnValue(makeReadStream(events));

      const result = await repo.findById(UniqueEntityID.create(ACTION_ID));

      expect(result.isRight()).toBe(true);
      expect((result.value as FundingAction).closed).toBe(true);
    });
  });
});
