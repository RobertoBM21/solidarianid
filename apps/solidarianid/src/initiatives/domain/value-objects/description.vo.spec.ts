import { Description, InvalidDescriptionError } from './description.vo';

describe('Description VO', () => {
  it('should create a valid description', () => {
    const result = Description.create('Una causa solidaria');

    expect(result.isRight()).toBe(true);
  });

  it('should fail on empty description', () => {
    const result = Description.create('  ');

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InvalidDescriptionError);
    }
  });
});
