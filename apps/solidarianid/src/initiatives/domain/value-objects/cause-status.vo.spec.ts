import { CauseAlreadyClosedError, CauseStatus } from './cause-status.vo';

describe('CauseStatus VO', () => {
  it('should create an open status by default', () => {
    const status = CauseStatus.create(false);

    expect(status.isOpen()).toBe(true);
  });

  it('should create an open status explicitly', () => {
    const status = CauseStatus.open();

    expect(status.isOpen()).toBe(true);
  });

  it('should create a closed status', () => {
    const status = CauseStatus.closed();

    expect(status.isClosed()).toBe(true);
  });

  it('should close an open cause status', () => {
    const status = CauseStatus.open();

    const result = status.close();

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.isClosed()).toBe(true);
    }
  });

  it('should fail to close an already closed cause status', () => {
    const status = CauseStatus.closed();

    const result = status.close();

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(CauseAlreadyClosedError);
    }
  });
});
