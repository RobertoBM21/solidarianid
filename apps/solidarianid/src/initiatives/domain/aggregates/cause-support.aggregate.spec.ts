import { UniqueEntityID } from '@app/shared/domain';
import {
  AnonymousSupporter,
  UserSupporter,
} from '../value-objects/supporter.vo';
import { CauseSupport } from './cause-support.aggregate';

describe('CauseSupport Aggregate', () => {
  it('should create a support for a user', () => {
    const causeId = UniqueEntityID.create().toString();
    const supporter = UserSupporter.create(UniqueEntityID.create());

    const result = CauseSupport.create({ causeId, supporter });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.causeId.toString()).toBe(causeId);
      expect(result.value.supporter.isUser()).toBe(true);
    }
  });

  it('should create a support for an anonymous supporter', () => {
    const causeId = UniqueEntityID.create().toString();
    const supporter = AnonymousSupporter.create(UniqueEntityID.create());

    const result = CauseSupport.create({ causeId, supporter });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.supporter.isAnonymous()).toBe(true);
    }
  });
});
