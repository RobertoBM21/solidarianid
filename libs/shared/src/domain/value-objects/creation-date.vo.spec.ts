import { CreationDate, InvalidDateError } from './creation-date.vo';

describe('CreationDate Value Object', () => {
  it('should create a CreationDate with the current date when no date is provided', () => {
    const result = CreationDate.create();
    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      const creationDate = result.value;
      const now = new Date();
      expect(creationDate.value.getFullYear()).toBe(now.getFullYear());
      expect(creationDate.value.getMonth()).toBe(now.getMonth());
      expect(creationDate.value.getDate()).toBe(now.getDate());
    }
  });

  it('should create a CreationDate with a valid past date', () => {
    const pastDate = new Date('2020-01-01');
    const result = CreationDate.create(pastDate);
    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      const creationDate = result.value;
      expect(creationDate.value).toEqual(pastDate);
    }
  });

  it('should return an error for an invalid date string', () => {
    const result = CreationDate.create('invalid-date-string');
    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      const error = result.value;
      expect(error).toBeInstanceOf(InvalidDateError);
      expect(error.message).toBe('Invalid date provided for creation date.');
    }
  });

  it('should return an error for a future date', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1); // Tomorrow
    const result = CreationDate.create(futureDate);
    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      const error = result.value;
      expect(error).toBeInstanceOf(InvalidDateError);
      expect(error.message).toBe('Creation date cannot be in the future.');
    }
  });
});
