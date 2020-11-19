import { testConnection } from './testDatabaseConnection';

testConnection(true).then(() => process.exit());
