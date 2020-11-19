import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'StringOfNumber', async: false })
export class isStringOfNumbers implements ValidatorConstraintInterface {
  validate(barcode: string): boolean {
    return /^\d+$/.test(barcode);
  }
  defaultMessage() {
    return 'The barcode must only be made up of numbers';
  }
}
