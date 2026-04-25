import { UniqueEntityID } from '@app/shared/domain';
import { InvalidActionCurrentAmountError } from '@app/shared/domain/value-objects/action-current-amount.vo';
import { InitiativeAlreadyClosedError } from '@app/shared/domain/value-objects/initiative-status.vo';
import { InvalidMoneyAmountError } from '@app/shared/domain/value-objects/money-amount.vo';
import { InvalidTitleError } from '@app/shared/domain/value-objects/title.vo';
import { CauseClosedEvent } from '../../../communities/domain/events/cause-closed.event';
import { FundingActionCreatedEvent } from '../../../initiatives/domain/events/funding-action-created.event';
import { Donation } from '../entities/donation.entity';
import { DonationProcessed } from '../events/donation-processed.event';
import { FundingAction } from './funding-action.aggregate';

const CAUSE_ID = UniqueEntityID.create().toString();

const makeFundingAction = (
  closed = false,
  currentAmount = 0,
): FundingAction => {
  const actionId = UniqueEntityID.create().toString();
  const action = FundingAction.create(
    { title: 'Test Action', causeId: CAUSE_ID },
    actionId,
  ).value as FundingAction;
  action.pullDomainEvents();
  if (currentAmount > 0) {
    action.acceptDonation(
      currentAmount,
      UniqueEntityID.create().toString(),
      'cs_test_seed',
      UniqueEntityID.create().toString(),
    );
    action.pullDomainEvents();
  }
  if (closed) {
    action.close();
    action.pullDomainEvents();
  }
  return action;
};

describe('FundingAction Aggregate', () => {
  describe('create', () => {
    it('should create a funding action with valid data and emit FundingActionCreatedEvent', () => {
      const result = FundingAction.create({
        title: 'Help Fund Schools',
        causeId: CAUSE_ID,
      });

      expect(result.isRight()).toBe(true);
      const action = result.value as FundingAction;
      expect(action.title).toBe('Help Fund Schools');
      expect(action.closed).toBe(false);
      expect(action.currentAmountValue).toBe(0);
      const events = action.pullDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(FundingActionCreatedEvent);
    });

    it('should create with explicit closed and currentAmount (no pending events)', () => {
      const result = FundingAction.create({
        title: 'Closed Action',
        causeId: CAUSE_ID,
        closed: true,
        currentAmount: 100,
      });

      expect(result.isRight()).toBe(true);
      const action = result.value as FundingAction;
      expect(action.closed).toBe(true);
      expect(action.currentAmountValue).toBe(100);
      expect(action.pullDomainEvents()).toHaveLength(0);
    });

    it('should fail with invalid title', () => {
      const result = FundingAction.create({
        title: '',
        causeId: CAUSE_ID,
      });

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(InvalidTitleError);
    });

    it('should fail with invalid current amount', () => {
      const result = FundingAction.create({
        title: 'Valid Title',
        causeId: CAUSE_ID,
        currentAmount: -5,
      });

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(InvalidActionCurrentAmountError);
    });
  });

  describe('close', () => {
    it('should close an open action and emit CauseClosedEvent', () => {
      const action = makeFundingAction();

      action.close();

      expect(action.closed).toBe(true);
      const events = action.pullDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(CauseClosedEvent);
    });

    it('should be idempotent on an already closed action (no duplicate event)', () => {
      const action = makeFundingAction(true);

      action.close();

      expect(action.closed).toBe(true);
      expect(action.pullDomainEvents()).toHaveLength(0);
    });
  });

  describe('validateDonationRequest', () => {
    it('should succeed for an open action with valid amount', () => {
      const action = makeFundingAction();

      const result = action.validateDonationRequest(50);

      expect(result.isRight()).toBe(true);
    });

    it('should fail when action is closed', () => {
      const action = makeFundingAction(true);

      const result = action.validateDonationRequest(50);

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(InitiativeAlreadyClosedError);
    });

    it('should fail with invalid amount', () => {
      const action = makeFundingAction();

      const result = action.validateDonationRequest(-10);

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(InvalidMoneyAmountError);
    });
  });

  describe('acceptDonation', () => {
    it('should create a donation, increment current amount, and emit DonationProcessed', () => {
      const action = makeFundingAction(false, 100);
      const donorId = UniqueEntityID.create().toString();
      const donationId = UniqueEntityID.create().toString();
      const externalPaymentId = 'cs_test_session_456';

      const result = action.acceptDonation(
        50,
        donorId,
        externalPaymentId,
        donationId,
      );

      expect(result.isRight()).toBe(true);
      const donation = result.value as Donation;
      expect(donation.amount).toBe(50);
      expect(donation.donorId).toBe(donorId);
      expect(donation.externalPaymentId).toBe(externalPaymentId);
      expect(donation.fundingActionId).toBe(action.id.toString());
      expect(action.currentAmountValue).toBe(150);
      const events = action.pullDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(DonationProcessed);
      const ev = events[0] as DonationProcessed;
      expect(ev.donationId).toBe(donationId);
      expect(ev.amount).toBe(50);
    });

    it('should fail with invalid amount', () => {
      const action = makeFundingAction();

      const result = action.acceptDonation(
        0,
        UniqueEntityID.create().toString(),
        'cs_test_session_789',
        UniqueEntityID.create().toString(),
      );

      expect(result.isLeft()).toBe(true);
    });
  });

  describe('pullDomainEvents', () => {
    it('should clear events after pulling', () => {
      const action = FundingAction.create({
        title: 'Test',
        causeId: CAUSE_ID,
      }).value as FundingAction;
      expect(action.pullDomainEvents()).toHaveLength(1);

      expect(action.pullDomainEvents()).toHaveLength(0);
    });
  });
});
