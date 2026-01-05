import { UniqueEntityID } from '@app/shared/domain';
import { CausesList, InvalidCausesListError } from './causes-list.vo';

describe('CausesList VO', () => {
  it('should create a list without duplicates', () => {
    const ids = [UniqueEntityID.create(), UniqueEntityID.create().value];

    const result = CausesList.create(ids);

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.value).toHaveLength(2);
    }
  });

  it('should fail on duplicated IDs', () => {
    const duplicatedId = UniqueEntityID.create().value;

    const result = CausesList.create([duplicatedId, duplicatedId]);

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InvalidCausesListError);
    }
  });

  it('should fail when adding a duplicate ID', () => {
    const id1 = UniqueEntityID.create();
    const id2 = UniqueEntityID.create();

    const listOrError = CausesList.create([id1]);
    expect(listOrError.isRight()).toBe(true);
    if (listOrError.isLeft()) {
      return;
    }
    const list = listOrError.value;

    const addResult = list.withAdded(id1);
    expect(addResult.isLeft()).toBe(true);
    if (addResult.isLeft()) {
      expect(addResult.value).toBeInstanceOf(InvalidCausesListError);
    }

    const addResult2 = list.withAdded(id2);
    expect(addResult2.isRight()).toBe(true);
    if (addResult2.isRight()) {
      expect(addResult2.value.value).toHaveLength(2);
    }
  });
});
