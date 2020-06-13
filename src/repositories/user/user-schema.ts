/**
 * A data transfer object containing each property's raw type that is mapped to the table `users`.
 */
export class UserSchema {
  public id?: string;
  public name?: string;
  public avatar?: string;
  public email?: string;
  public points?: number;
  public token?: string;
  public tokenExpire?: Date;
  public expire?: Date;
}
