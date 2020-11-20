export enum UserErrorMessage {
  invalidCredentials = 'Invalid credentials',
  invalidDetails = 'Invalid details provided',
  nonUniqueEmail = 'Email already registered',
}

export enum ContactErrorMessage {
  authenticationRequired = 'Must provide authentication to access contacts data',
}

export enum PhoneNumberErrorMessage {
  invalidNumber = 'Phone number can only consist of numbers',
  insufficientLength = 'Phone number does not fulfill minimum character length',
  excessiveLength = 'Phone number exceeds maximum character length',
}

export enum ErrorType {
  stringOfNumbers = 'StringOfNumber',
  minLength = 'minLength',
  maxLength = 'maxLength',
}

export interface TypeOrmError {
  code: string;
}

export enum TypeOrmErrorList {
  PG_UNIQUE_VIOLATION = '23505',
}
