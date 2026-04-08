import { Cause } from './cause.entity';

describe('Cause Entity', () => {
  it('should create a cause with valid data', () => {
    const result = Cause.create({
      title: 'Sample cause',
      description: 'A description',
      duration: '3 months',
      ods: 5,
    });

    expect(result.isRight()).toBe(true);
    const cause = result.value as Cause;
    expect(cause.id).toBeDefined();
    expect(cause.title).toBe('Sample cause');
    expect(cause.description).toBe('A description');
    expect(cause.duration).toBe('3 months');
    expect(cause.ods).toBe(5);
    expect(cause.closed).toBe(false);
    expect(cause.createdAt).toBeInstanceOf(Date);
  });

  it('should fail with invalid ODS', () => {
    const result = Cause.create({
      title: 'Sample cause',
      description: 'A description',
      duration: '3 months',
      ods: 99,
    });

    expect(result.isLeft()).toBe(true);
  });
});
