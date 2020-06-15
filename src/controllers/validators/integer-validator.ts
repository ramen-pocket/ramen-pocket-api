import { Validator } from './validator';
import { NotIntegerError } from '../../errors/validation-error';

export class IntegerValidator implements Validator<string, number> {
  public constructor(private readonly message?: string) {}

  public validate(value: string): number {
    const result = Number(value);
    if (!Number.isInteger(result)) {
      throw new NotIntegerError(this.message);
    }

    return result;
  }
}
