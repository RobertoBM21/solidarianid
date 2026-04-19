import {
  InitiativeAlreadyClosedError,
  InitiativeStatus,
} from './initiative-status.vo';

describe('InitiativeStatus VO', () => {
  it('should create an open status by default', () => {
    const status = InitiativeStatus.create(false);

    expect(status.isOpen()).toBe(true);
  });

  it('should create an open status explicitly', () => {
    const status = InitiativeStatus.open();

    expect(status.isOpen()).toBe(true);
  });

  it('should create a closed status', () => {
    const status = InitiativeStatus.closed();

    expect(status.isClosed()).toBe(true);
  });

  it('should close an open initiative status', () => {
    const status = InitiativeStatus.open();

    const result = status.close();

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.isClosed()).toBe(true);
    }
  });

  it('should fail to close an already closed initiative status', () => {
    const status = InitiativeStatus.closed();

    const result = status.close();

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InitiativeAlreadyClosedError);
    }
  });
});
