import { UniqueEntityID } from '@app/shared/domain';
import { InvalidMoneyAmountError } from '@app/shared/domain/value-objects/money-amount.vo';
import { Donation } from './donation.entity';

describe('Donation Entity', () => {
  const validData = {
    donorId: UniqueEntityID.create().toString(),
    fundingActionId: UniqueEntityID.create().toString(),
    externalPaymentId: 'cs_test_session_123',
    amount: 50,
  };

  it('should create a donation with valid data', () => {
    const result = Donation.create(validData);

    expect(result.isRight()).toBe(true);
    const donation = result.value as Donation;
    expect(donation.amount).toBe(50);
    expect(donation.donorId).toBe(validData.donorId);
    expect(donation.fundingActionId).toBe(validData.fundingActionId);
    expect(donation.externalPaymentId).toBe(validData.externalPaymentId);
    expect(donation.createdAt).toBeInstanceOf(Date);
  });

  it('should create a donation with an explicit date', () => {
    const date = new Date('2026-01-15');
    const result = Donation.create({ ...validData, date });

    expect(result.isRight()).toBe(true);
    const donation = result.value as Donation;
    expect(donation.createdAt).toEqual(date);
  });

  it('should preserve id when provided', () => {
    const id = UniqueEntityID.create();
    const result = Donation.create(validData, id);

    expect(result.isRight()).toBe(true);
    const donation = result.value as Donation;
    expect(donation.id.equals(id)).toBe(true);
  });

  it('should fail with invalid amount (zero)', () => {
    const result = Donation.create({ ...validData, amount: 0 });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidMoneyAmountError);
  });

  it('should fail with invalid amount (negative)', () => {
    const result = Donation.create({ ...validData, amount: -10 });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidMoneyAmountError);
  });
});
