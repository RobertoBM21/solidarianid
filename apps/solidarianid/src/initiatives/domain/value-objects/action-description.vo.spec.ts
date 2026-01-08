import {
  ActionDescription,
  InvalidActionDescriptionError,
} from './action-description.vo';

describe('ActionDescription VO', () => {
  it('Should create a valid description', () => {
    const result = ActionDescription.create('Descripcion valida');

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.value).toBe('Descripcion valida');
    }
  });

  it('Should fail on empty description', () => {
    const result = ActionDescription.create('   ');

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InvalidActionDescriptionError);
    }
  });

  it('Should fail on too long description', () => {
    const longDescription = 'A'.repeat(1001);

    const result = ActionDescription.create(longDescription);

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InvalidActionDescriptionError);
    }
  });
});
