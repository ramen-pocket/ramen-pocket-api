import { createPool, PoolConnection } from 'mariadb';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { DATETIME_FORMATE } from '../../constants/database';
import moment from 'moment';

const { DB_HOST, DB_USERNAME, DB_PASSWORD, DB_DATABASE } = process.env;

const pool = createPool({
  host: DB_HOST,
  user: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  connectionLimit: 5,
});

export class Authenticator {
  private static readonly READ_TOKEN_EXPIRE_SQL_SCRIPT =
    'SELECT id, expire FROM users WHERE token = ?';

  private static readonly USER_CHECK_SQL_SCRIPT =
    'SELECT COUNT(*) AS count FROM users WHERE id = ?';

  private static readonly UPDATE_TOKEN_SQL_SCRIPT =
    'UPDATE users SET token = ?, tokenExpire = ?, expire = ? WHERE id = ?';

  private static readonly CREATE_USER_SQL_SCRIPT =
    'INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

  private googleClientId: string;
  private googleClient: OAuth2Client;
  private connection: PoolConnection;
  private userId: string;

  constructor(clientId: string) {
    this.googleClientId = clientId;
    this.googleClient = new OAuth2Client(clientId);
  }

  public getUserId(): string {
    return this.userId;
  }

  async connectToDatabase() {
    this.connection = await pool.getConnection();
  }

  async verifyLocally(token: string): Promise<boolean> {
    if (!this.connection) {
      throw new Error('No connection established.');
    }

    const results = await this.connection.query(Authenticator.READ_TOKEN_EXPIRE_SQL_SCRIPT, [
      token,
    ]);
    if (results.length <= 0) {
      return false;
    }

    const [user] = results;
    this.userId = user.id;

    return !user.expire || moment.utc(user.expire).valueOf() < moment.utc().valueOf();
  }

  async verifyByGoogle(token: string): Promise<boolean> {
    if (!this.connection) {
      throw new Error('No connection established.');
    }

    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: this.googleClientId,
      });

      const payload = ticket.getPayload();
      const userId = payload.sub;
      const expire = payload.exp;
      this.userId = userId;

      const [result] = await this.connection.query(Authenticator.USER_CHECK_SQL_SCRIPT, [userId]);
      if (result.count > 0) {
        await this.updateTokenData(userId, token, expire);
      } else {
        await this.createNewUser(token, payload);
      }

      return true;
    } catch (err) {
      console.log('Error in Authenticator.verifyByGoogle');
      console.log(err);

      return false;
    }
  }

  private calculateTokenExpireTime(expire: number): string {
    return moment.unix(expire).format(DATETIME_FORMATE);
  }

  private calculateExpireTime(): string {
    return moment
      .utc()
      .add(1, 'day')
      .format(DATETIME_FORMATE);
  }

  private async updateTokenData(userId: string, token: string, expire: number) {
    await this.connection.query(Authenticator.UPDATE_TOKEN_SQL_SCRIPT, [
      token,
      this.calculateTokenExpireTime(expire),
      this.calculateExpireTime(),
      userId,
    ]);
  }

  private async createNewUser(token: string, payload: TokenPayload) {
    const { email, picture, name, sub, exp } = payload;
    await this.connection.query(Authenticator.CREATE_USER_SQL_SCRIPT, [
      sub,
      name,
      picture,
      email,
      0,
      token,
      this.calculateTokenExpireTime(exp),
      this.calculateExpireTime(),
    ]);
  }

  async disconnectToDatabase() {
    if (this.connection) {
      this.connection.end();
    }
  }
}
