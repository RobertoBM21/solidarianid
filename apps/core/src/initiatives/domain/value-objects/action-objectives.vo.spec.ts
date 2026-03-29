import {
  ActionObjectives,
  InvalidActionObjectivesError,
} from './action-objectives.vo';

describe('ActionObjectives VO', () => {
  it('Should create objectives list', () => {
    const result = ActionObjectives.create(['Goal 1', 'Goal 2']);

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.value).toEqual(['Goal 1', 'Goal 2']);
    }
  });

  it('Should allow empty objectives', () => {
    const result = ActionObjectives.create([]);

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.value).toEqual([]);
    }
  });

  it('Should fail on empty objective items', () => {
    const result = ActionObjectives.create(['', 'Goal']);

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InvalidActionObjectivesError);
    }
  });
});
