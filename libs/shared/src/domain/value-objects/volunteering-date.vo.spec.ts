import {
  InvalidVolunteeringDateError,
  VolunteeringDate,
} from './volunteering-date.vo';

describe('VolunteeringDate Value Object', () => {
  it('should create a VolunteeringDate with a valid date', () => {
    const date = new Date('2026-01-01T10:00:00Z');
    const result = VolunteeringDate.create(date);
    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      const volunteeringDate = result.value;
      expect(volunteeringDate.value).toEqual(date);
    }
  });

  it('should create a VolunteeringDate with a valid date string', () => {
    const dateString = '2026-01-01T10:00:00Z';
    const result = VolunteeringDate.create(dateString);
    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      const volunteeringDate = result.value;
      expect(volunteeringDate.value).toEqual(new Date(dateString));
    }
  });

  it('should return an error for an invalid date string', () => {
    const result = VolunteeringDate.create('invalid-date-string');
    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      const error = result.value;
      expect(error).toBeInstanceOf(InvalidVolunteeringDateError);
      expect(error.message).toBe(
        'Invalid date provided for volunteering date.',
      );
    }
  });
});
