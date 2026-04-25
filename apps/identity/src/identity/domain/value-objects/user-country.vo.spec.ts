import { InvalidUserCountryError, UserCountry } from './user-country.vo';

describe('User country value object', () => {
  const mockCountryChecker = {
    isValidCountryCode: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Basic path tests

  // 1. S1-C1-S2-FIN
  it('should return an error when the country code is not 2 characters long', () => {
    const result = UserCountry.create('e', mockCountryChecker);

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InvalidUserCountryError);
      expect(result.value.message).toBe(
        'User country must be a valid 2-letter alpha code.',
      );
    }
    expect(mockCountryChecker.isValidCountryCode).not.toHaveBeenCalled();
  });

  // 2. S1-C1-C2-S2-FIN
  it('should return an error when the country code is not a valid alfa-2 code', () => {
    mockCountryChecker.isValidCountryCode.mockReturnValue(false);

    const result = UserCountry.create('xx', mockCountryChecker);

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InvalidUserCountryError);
      expect(result.value.message).toBe(
        'User country must be a valid 2-letter alpha code.',
      );
    }
    expect(mockCountryChecker.isValidCountryCode).toHaveBeenCalledWith('xx');
  });

  // 3. S1-C1-C2-S3-FIN
  it('should create a valid user country', () => {
    mockCountryChecker.isValidCountryCode.mockReturnValue(true);

    const result = UserCountry.create('es', mockCountryChecker);

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      const userCountry = result.value;
      expect(userCountry.value).toBe('es');
    }

    expect(mockCountryChecker.isValidCountryCode).toHaveBeenCalledWith('es');
  });
});
