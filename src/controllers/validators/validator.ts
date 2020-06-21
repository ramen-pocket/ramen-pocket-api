export interface Validator<I, O> {
  validate(value: I): O;
}

export interface ValidatorConfigOption<T> {
  value: T;
  message?: string;
}
