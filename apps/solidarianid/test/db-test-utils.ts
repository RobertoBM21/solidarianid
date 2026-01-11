import { DataSource } from 'typeorm';

export async function clearDatabase(dataSource: DataSource): Promise<void> {
  const entities = dataSource.entityMetadatas;
  const tableNames = entities
    .map((entity) => `"${entity.tableName}"`)
    .join(', ');

  if (tableNames.length > 0) {
    await dataSource.query(`TRUNCATE ${tableNames} RESTART IDENTITY CASCADE;`);
  }
}

export async function waitFor(
  predicate: () => Promise<boolean> | boolean,
  timeout = 5000,
  interval = 100,
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const result = await predicate();
    if (result) return;
    await new Promise((r) => setTimeout(r, interval));
  }

  throw new Error('Timed out waiting for system to stabilize');
}
