import { UniqueEntityID } from '@app/shared/domain';
import { AnonymousSupporter, UserSupporter } from './supporter.vo';

describe('Supporter VO', () => {
  it('should create a user supporter with correct type and id', () => {
    const userId = UniqueEntityID.create();
    const supporter = UserSupporter.create(userId);

    expect(supporter.isUser()).toBe(true);
    expect(supporter.id.toString()).toBe(userId.toString());
  });

  it('should create an anonymous supporter with correct type and id', () => {
    const anonId = UniqueEntityID.create();
    const supporter = AnonymousSupporter.create(anonId);

    expect(supporter.isAnonymous()).toBe(true);
    expect(supporter.id.toString()).toBe(anonId.toString());
    expect(supporter.isUser()).toBe(false);
  });

  it('should expose id through getter and enforce type checks', () => {
    const userId = UniqueEntityID.create();
    const supporter = UserSupporter.create(userId);

    expect(supporter.id).toEqual(userId);
    expect(supporter.isAnonymous()).toBe(false);
  });
});
