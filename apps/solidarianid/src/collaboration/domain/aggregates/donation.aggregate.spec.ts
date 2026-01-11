import { UniqueEntityID } from '@app/shared/domain';
import { InvalidDateError } from '@app/shared/domain/value-objects/creation-date.vo';
import { InvalidMoneyAmountError } from '@app/shared/domain/value-objects/money-amount.vo';
import { Donation } from './donation.aggregate';

describe('Donation Aggregate', () => {
  it('should create a Donation with valid properties', () => {
    const donorId = UniqueEntityID.create();
    const fundingActionId = UniqueEntityID.create();

    const data = {
      donorId: donorId.toString(),
      fundingActionId: fundingActionId.toString(),
      amount: 120.5,
    };

    const result = Donation.create(data);

    expect(result.isRight()).toBe(true);
    if (result.isLeft()) return;

    const donation = result.value;
    expect(donation.amount).toBeCloseTo(120.5);
    expect(donation.donorId).toBe(donorId.toString());
    expect(donation.fundingActionId).toBe(fundingActionId.toString());
    expect(donation.createdAt).toBeInstanceOf(Date);
  });

  it('should fail to create a Donation with invalid amount', () => {
    const donorId = UniqueEntityID.create();
    const fundingActionId = UniqueEntityID.create();

    const data = {
      donorId: donorId.toString(),
      fundingActionId: fundingActionId.toString(),
      amount: -10,
    };

    const result = Donation.create(data);

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InvalidMoneyAmountError);
    }
  });

  it('should fail to create a Donation with invalid date', () => {
    const donorId = UniqueEntityID.create();
    const fundingActionId = UniqueEntityID.create();

    const data = {
      donorId: donorId.toString(),
      fundingActionId: fundingActionId.toString(),
      amount: 50,
      date: new Date('invalid-date-string'),
    };

    const result = Donation.create(data);

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InvalidDateError);
    }
  });
});
