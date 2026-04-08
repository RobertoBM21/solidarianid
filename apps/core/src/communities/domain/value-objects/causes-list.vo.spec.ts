import { Cause } from '../entities/cause.entity';
import { CausesList, InvalidCausesListError } from './causes-list.vo';

describe('CausesList VO', () => {
  const cause1 = Cause.create({
    title: 'Cause 1',
    description: 'Description for cause 1',
    duration: '1 month',
    ods: 1,
    closed: false,
    createdAt: new Date(),
  }).value as Cause;

  const cause2 = Cause.create({
    title: 'Cause 2',
    description: 'Description for cause 2',
    duration: '2 months',
    ods: 2,
    closed: false,
    createdAt: new Date(),
  }).value as Cause;

  it('should create a list without duplicates', () => {
    const ids = [cause1, cause2];

    const result = CausesList.create(ids);

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.value).toHaveLength(2);
    }
  });

  it('should fail on duplicated IDs', () => {
    const result = CausesList.create([cause1, cause1]);

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InvalidCausesListError);
    }
  });

  it('should fail when adding a duplicate ID', () => {
    const listOrError = CausesList.create([cause1]);
    expect(listOrError.isRight()).toBe(true);
    if (listOrError.isLeft()) {
      return;
    }
    const list = listOrError.value;

    const addResult = list.withAdded(cause1);
    expect(addResult.isLeft()).toBe(true);
    if (addResult.isLeft()) {
      expect(addResult.value).toBeInstanceOf(InvalidCausesListError);
    }

    const addResult2 = list.withAdded(cause2);
    expect(addResult2.isRight()).toBe(true);
    if (addResult2.isRight()) {
      expect(addResult2.value.value).toHaveLength(2);
    }
  });
});
