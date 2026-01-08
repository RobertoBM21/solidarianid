import { ActionAlreadyClosedError, ActionStatus } from './action-status.vo';

describe('ActionStatus VO', () => {
  it('Should be open by default', () => {
    const status = ActionStatus.open();

    expect(status.isOpen()).toBe(true);
    expect(status.isClosed()).toBe(false);
  });

  it('Should close an open action', () => {
    const status = ActionStatus.open();
    const result = status.close();

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.isClosed()).toBe(true);
    }
  });

  it('Should fail closing a closed action', () => {
    const status = ActionStatus.closed();
    const result = status.close();

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ActionAlreadyClosedError);
    }
  });
});
