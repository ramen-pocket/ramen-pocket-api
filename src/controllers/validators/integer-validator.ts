import { Validator, ValidatorConfigOption } from './validator';
import {
  NotIntegerError,
  ValueExceedMaximumError,
  ValueFallBehindMinimumError,
} from '../../errors/validation-error';

export class IntegerValidatorConfig {
  message?: string;
  minimum?: ValidatorConfigOption<number>;
  maximum?: ValidatorConfigOption<number>;
}

export class IntegerValidator implements Validator<string, number> {
  private readonly config?: IntegerValidatorConfig;

  public constructor(config?: IntegerValidatorConfig) {
    this.config = {
      message: config.message || 'The value must be an integer.',
      minimum: config.minimum && {
        value: config.minimum.value,
        message: config.minimum.message || 'The value must be less than maximum value',
      },
      maximum: config.maximum && {
        value: config.maximum.value,
        message: config.maximum.message || 'The value must be greater than minimum value',
      },
    };
  }

  public validate(value: string): number {
    const result = Number(value);
    if (!Number.isInteger(result)) {
      throw new NotIntegerError(this.config.message);
    }

    if (typeof this.config.maximum === 'object' && result > this.config.maximum.value) {
      throw new ValueExceedMaximumError(this.config.maximum.message);
    }

    if (typeof this.config.minimum === 'object' && result < this.config.minimum.value) {
      throw new ValueFallBehindMinimumError(this.config.minimum.message);
    }

    return result;
  }
}
