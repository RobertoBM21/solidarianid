import { UniqueEntityID } from '@app/shared/domain';
import { InvalidActionCurrentAmountError } from '@app/shared/domain/value-objects/action-current-amount.vo';
import { InitiativeAlreadyClosedError } from '@app/shared/domain/value-objects/initiative-status.vo';
import { InvalidMoneyAmountError } from '@app/shared/domain/value-objects/money-amount.vo';
import { InvalidTitleError } from '@app/shared/domain/value-objects/title.vo';
import { Donation } from '../entities/donation.entity';
import { FundingAction } from './funding-action.aggregate';

const CAUSE_ID = UniqueEntityID.create().toString();

const makeFundingAction = (closed = false, currentAmount = 0) =>
  FundingAction.create({
    title: 'Test Action',
    causeId: CAUSE_ID,
    closed,
    currentAmount,
  }).value as FundingAction;

describe('FundingAction Aggregate', () => {
  describe('create', () => {
    it('should create a funding action with valid data', () => {
      const result = FundingAction.create({
        title: 'Help Fund Schools',
        causeId: CAUSE_ID,
      });

      expect(result.isRight()).toBe(true);
      const action = result.value as FundingAction;
      expect(action.title).toBe('Help Fund Schools');
      expect(action.closed).toBe(false);
      expect(action.currentAmountValue).toBe(0);
    });

    it('should create with explicit closed and currentAmount', () => {
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
    it('should close an open action', () => {
      const action = makeFundingAction();

      action.close();

      expect(action.closed).toBe(true);
    });

    it('should be idempotent on an already closed action', () => {
      const action = makeFundingAction(true);

      action.close();

      expect(action.closed).toBe(true);
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
    it('should create a donation and increment current amount', () => {
      const action = makeFundingAction(false, 100);

      const donorId = UniqueEntityID.create().toString();
      const externalPaymentId = 'cs_test_session_456';
      const result = action.acceptDonation(50, donorId, externalPaymentId);

      expect(result.isRight()).toBe(true);
      const donation = result.value as Donation;
      expect(donation.amount).toBe(50);
      expect(donation.donorId).toBe(donorId);
      expect(donation.externalPaymentId).toBe(externalPaymentId);
      expect(donation.fundingActionId).toBe(action.id.toString());
      expect(action.currentAmountValue).toBe(150);
    });

    it('should fail with invalid amount', () => {
      const action = makeFundingAction();

      const result = action.acceptDonation(
        0,
        UniqueEntityID.create().toString(),
        'cs_test_session_789',
      );

      expect(result.isLeft()).toBe(true);
    });
  });
});
