export interface Validator<I, O> {
  validate(value: I): O;
}
