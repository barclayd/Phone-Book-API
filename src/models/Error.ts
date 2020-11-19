export enum UserErrorMessage {
  alreadyConfirmed = 'Already confirmed',
  invalidToken = 'Invalid token',
  invalidOperation = 'Invalid operation',
  invalidCredentials = 'Invalid credentials',
  invalidDetails = 'Invalid details provided',
  nonUniqueEmail = 'Email already registered',
}

export interface TypeOrmError {
  code: string;
}

export enum TypeOrmErrorList {
  PG_UNIQUE_VIOLATION = '23505',
}
