import { readFileSync } from 'fs';

export function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

export function getEnvVarAsInt(key: string, defaultValue?: number): number {
  const value = process.env[key];
  if (value) {
    const intValue = parseInt(value, 10);
    if (isNaN(intValue)) {
      throw new Error(`Environment variable ${key} is not a valid integer`);
    }
    return intValue;
  } else if (!defaultValue) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return defaultValue;
}

export function getFileFromEnvVar(key: string): string {
  const filePath = getEnvVar(key);
  try {
    return readFileSync(filePath, 'utf8');
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new Error(`Could not read file at ${filePath}: ${err}`);
  }
}
