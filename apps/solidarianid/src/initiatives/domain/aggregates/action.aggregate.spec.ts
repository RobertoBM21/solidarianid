import { UniqueEntityID } from '@app/shared/domain';
import { FundingAction, VolunteeringAction } from './action.aggregate';

describe('Action Aggregate', () => {
  it('Should create a volunteering action', () => {
    const result = VolunteeringAction.create({
      title: 'Planting Day',
      description: 'Community gathering to plant trees',
      objectives: ['Target participants: 50'],
      start: '2025-01-01T10:00:00Z',
      end: '2025-01-01T12:00:00Z',
      causeId: UniqueEntityID.create().toString(),
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.type).toBe('volunteering');
      expect(result.value.start).toBeInstanceOf(Date);
      expect(result.value.end).toBeInstanceOf(Date);
    }
  });

  it('Should create a funding action', () => {
    const result = FundingAction.create({
      title: 'Buy Supplies',
      description: 'Purchase supplies for the cause',
      objectives: ['Target meals: 500'],
      targetAmount: 1000,
      causeId: UniqueEntityID.create().toString(),
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.type).toBe('funding');
      expect(result.value.targetAmountValue).toBe(1000);
    }
  });
});
