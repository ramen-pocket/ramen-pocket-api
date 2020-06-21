export class DatabaseConnectionOptions {
  /**
   * The host name of the database server. (e.g. abc.domain.com)
   */
  public host?: string;

  /**
   * The username of the user.
   */
  public username?: string;

  /**
   * The password of the user.
   */
  public password?: string;

  /**
   * The name of the database you want to access.
   */
  public database?: string;
}
