import { CauseCreated } from '../events/cause-created.event';
import { Cause } from './cause.aggregate';

describe('Cause Aggregate', () => {
  it('should create a cause with valid data', () => {
    const result = Cause.create({
      title: 'Sample cause',
      description: 'A description',
      duration: '3 months',
      ods: 5,
      communityId: 'c6bfa3d6-3f4e-4c20-8d2e-4d2ff6b9d8c1',
    });

    expect(result.isRight()).toBe(true);
  });

  it('should generate a domain event upon creation', () => {
    const result = Cause.create({
      title: 'Sample cause',
      description: 'A description',
      duration: '3 months',
      ods: 5,
      communityId: 'c6bfa3d6-3f4e-4c20-8d2e-4d2ff6b9d8c1',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      const cause = result.value;
      const events = cause.pullDomainEvents();
      expect(events.length).toBe(1);
      expect(events[0].constructor).toBe(CauseCreated);
    }
  });

  it('should fail with invalid ODS', () => {
    const result = Cause.create({
      title: 'Sample cause',
      description: 'A description',
      duration: '3 months',
      ods: 99,
      communityId: 'c6bfa3d6-3f4e-4c20-8d2e-4d2ff6b9d8c1',
    });

    expect(result.isLeft()).toBe(true);
  });

  it('should close an open cause', () => {
    const causeOrError = Cause.create({
      title: 'Sample cause',
      description: 'A description',
      duration: '1 month',
      ods: 5,
      communityId: 'c6bfa3d6-3f4e-4c20-8d2e-4d2ff6b9d8c1',
    });
    expect(causeOrError.isRight()).toBe(true);
    if (causeOrError.isRight()) {
      const cause = causeOrError.value;
      const result = cause.close();
      expect(result.isRight()).toBe(true);
      expect(cause.closed).toBe(true);
    }
  });
});
