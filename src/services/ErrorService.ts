import { QueryFailedError } from 'typeorm';
import { TypeOrmError, TypeOrmErrorList } from '@/models/Error';

export class ErrorService {
  private error: TypeOrmError;

  constructor(errorThrown: any) {
    if (ErrorService.isTypeOrmError(errorThrown)) {
      this.error = errorThrown;
    }
  }

  private static isTypeOrmError = (
    err: any,
  ): err is QueryFailedError & { code: string } =>
    err instanceof QueryFailedError;

  get isUniqueError(): boolean {
    return this.error.code === TypeOrmErrorList.PG_UNIQUE_VIOLATION;
  }
}
