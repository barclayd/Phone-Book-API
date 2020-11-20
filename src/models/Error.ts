export enum UserErrorMessage {
  invalidCredentials = 'Invalid credentials',
  invalidDetails = 'Invalid details provided',
  nonUniqueEmail = 'Email already registered',
}

export enum ContactErrorMessage {
  authenticationRequired = 'Must provide authentication to access contacts data',
}

export interface TypeOrmError {
  code: string;
}

export enum TypeOrmErrorList {
  PG_UNIQUE_VIOLATION = '23505',
}
