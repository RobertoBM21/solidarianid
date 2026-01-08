import { ActionTitle, InvalidActionTitleError } from './action-title.vo';

describe('ActionTitle VO', () => {
  it('Should create a valid title', () => {
    const result = ActionTitle.create('Recogida');

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.value).toBe('Recogida');
    }
  });

  it('Should fail on empty title', () => {
    const result = ActionTitle.create('   ');

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InvalidActionTitleError);
    }
  });

  it('Should fail on too long title', () => {
    const longTitle = 'A'.repeat(256);

    const result = ActionTitle.create(longTitle);

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InvalidActionTitleError);
    }
  });
});
