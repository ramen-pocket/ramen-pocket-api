/**
 * A data transfer object that contains login information.
 */
export class SignInInformationDto {
  public userId: string;
  public name: string;
  public avatar: string;
  public email: string;
  public expire: Date;
}
