import { createConnection } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export const testConnection = async (drop = false) =>
  createConnection({
    name: 'default',
    type: 'postgres',
    host: process.env.NODE_ENV === 'ci' ? 'db' : 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'phonebook-api-test-dev',
    synchronize: drop,
    dropSchema: drop,
    entities: [__dirname + '/../../src/entity/**/*.ts'],
    migrations: [__dirname + '/../../src/migration/**/*.ts'],
    subscribers: [__dirname + '/../../src/subscriber/**/*.ts'],
    namingStrategy: new SnakeNamingStrategy(),
    cli: {
      entitiesDir: `${__dirname}/../../src/entity`,
      migrationsDir: `${__dirname}/../../src/migration`,
      subscribersDir: `${__dirname}/../../src/subscriber`,
    },
  });
