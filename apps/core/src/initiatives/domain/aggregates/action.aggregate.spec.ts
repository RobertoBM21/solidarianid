import { UniqueEntityID } from '@app/shared/domain';
import { FundingAction, VolunteeringAction } from './action.aggregate';

describe('Action Aggregate', () => {
  it('should create a volunteering action', () => {
    const result = VolunteeringAction.create({
      title: 'Planting Day',
      description: 'Community gathering to plant trees',
      objectives: ['Target participants: 50'],
      start: '2025-01-01T10:00:00Z',
      end: '2025-01-01T12:00:00Z',
      causeId: UniqueEntityID.create().toString(),
    });

    expect(result.value).toBeInstanceOf(VolunteeringAction);
    const action = result.value as VolunteeringAction;
    expect(action.type).toBe('volunteering');
    expect(action.start).toBeInstanceOf(Date);
    expect(action.end).toBeInstanceOf(Date);
  });

  it('should create a funding action', () => {
    const result = FundingAction.create({
      title: 'Buy Supplies',
      description: 'Purchase supplies for the cause',
      objectives: ['Target meals: 500'],
      targetAmount: 1000,
      causeId: UniqueEntityID.create().toString(),
    });

    expect(result.value).toBeInstanceOf(FundingAction);
    const action = result.value as FundingAction;
    expect(action.type).toBe('funding');
    expect(action.targetAmountValue).toBe(1000);
  });
});
