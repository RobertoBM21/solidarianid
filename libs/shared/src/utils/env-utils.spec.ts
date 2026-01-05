import { unlink, writeFile } from 'fs/promises';
import { v4 } from 'uuid';
import { getEnvVar, getEnvVarAsInt, getSecretFromEnvVar } from './env-utils';

describe('environment utilities', () => {
  const FILE_PATH = `./test_secret.${v4()}`;

  beforeAll(async () => {
    await writeFile(FILE_PATH, 'super_secret_value');
  });

  afterAll(async () => {
    await unlink(FILE_PATH);
  });

  it('should get environment variable as string', () => {
    process.env.TEST_ENV_VAR = 'test_value';

    const value = getEnvVar('TEST_ENV_VAR');

    expect(value).toBe('test_value');
  });

  it('should throw error if environment variable is not set', () => {
    delete process.env.TEST_ENV_VAR;

    expect(() => getEnvVar('TEST_ENV_VAR')).toThrow(
      'Environment variable TEST_ENV_VAR is not set',
    );
  });

  it('should get environment variable as integer', () => {
    process.env.TEST_INT_ENV_VAR = '42';

    const value = getEnvVarAsInt('TEST_INT_ENV_VAR');

    expect(value).toBe(42);
  });

  it('should return default value if integer environment variable is not set', () => {
    delete process.env.TEST_INT_ENV_VAR;

    const value = getEnvVarAsInt('TEST_INT_ENV_VAR', 100);

    expect(value).toBe(100);
  });

  it('should throw error if integer environment variable is not a valid integer', () => {
    process.env.TEST_INT_ENV_VAR = 'not_an_integer';

    expect(() => getEnvVarAsInt('TEST_INT_ENV_VAR')).toThrow(
      'Environment variable TEST_INT_ENV_VAR is not a valid integer',
    );
  });

  it('should get secret environment variable from file', () => {
    process.env.TEST_SECRET_ENV_VAR_FILE = FILE_PATH;

    const value = getSecretFromEnvVar('TEST_SECRET_ENV_VAR');

    expect(value).toBe('super_secret_value');
  });

  it('should get secret environment variable from direct value', () => {
    process.env.TEST_SECRET_ENV_VAR = 'direct_secret_value';

    const value = getSecretFromEnvVar('TEST_SECRET_ENV_VAR');

    expect(value).toBe('direct_secret_value');
  });

  it('should throw error if secret environment variable and file are not set', () => {
    delete process.env.TEST_SECRET_ENV_VAR;
    delete process.env.TEST_SECRET_ENV_VAR_FILE;

    expect(() => getSecretFromEnvVar('TEST_SECRET_ENV_VAR')).toThrow(
      'Environment variable TEST_SECRET_ENV_VAR or TEST_SECRET_ENV_VAR_FILE is not set',
    );
  });

  it('should throw error if secret environment variable file cannot be read', () => {
    process.env.TEST_SECRET_ENV_VAR_FILE = `./non_existent_file.${v4()}`;

    expect(() => getSecretFromEnvVar('TEST_SECRET_ENV_VAR')).toThrow(
      /Could not read file at/,
    );
  });
});
