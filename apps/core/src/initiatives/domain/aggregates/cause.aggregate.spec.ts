import { CauseAggr } from './cause.aggregate';

describe('Cause Aggregate', () => {
  it('should create a cause with valid data', () => {
    const result = CauseAggr.create({
      id: '72fbbd7f-f2dc-43fb-8c28-550ea7f5e823',
      communityId: 'c6bfa3d6-3f4e-4c20-8d2e-4d2ff6b9d8c1',
    });

    expect(result).toBeDefined();
  });

  it('should close an open cause', () => {
    const cause = CauseAggr.create({
      id: '72fbbd7f-f2dc-43fb-8c28-550ea7f5e823',
      communityId: 'c6bfa3d6-3f4e-4c20-8d2e-4d2ff6b9d8c1',
    });
    const result = cause.close();
    expect(result.isRight()).toBe(true);
    expect(cause.closed).toBe(true);
  });

  it('should not allow closing an already closed cause', () => {
    const cause = CauseAggr.create({
      id: '72fbbd7f-f2dc-43fb-8c28-550ea7f5e823',
      communityId: 'c6bfa3d6-3f4e-4c20-8d2e-4d2ff6b9d8c1',
      closed: true,
    });
    const result = cause.close();
    expect(result.isLeft()).toBe(true);
  });
});
