import { QueryAgent } from '../../database/query-agent';
import { SelectQueryResult } from '../../database/select-query-result';
import { Counter } from '../../database/counter';
import { OkPacket } from '../../database/ok-packet';
import { DateProvider } from '../../providers/date-provider/date-provider';
import { UserEntity } from '../../entities/user-entity';
import { ProfileEntity } from '../../entities/profile-entity';
import { UserNotFound } from '../../errors/service-error';
import { UserRepository } from './user-repository';
import { UserSchema } from './user-schema';

const SQL_SELECT_EXIPRE = `SELECT expire FROM users WHERE token = ?`;
const SQL_INSERT_USER = `INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
const SQL_SELECT_PROFILE = `SELECT name, avatar, points FROM users WHERE id = ?`;
const SQL_UPDATE_USER_TOKEN = `UPDATE users SET token = ?, tokenExpire = ?, expire = ? WHERE id = ?`;
const SQL_CHECK_ID_EXIST = `SELECT COUNT(*) AS count FROM users WHERE id = ?`;

export class UserStore implements UserRepository {
  constructor(
    private readonly queryAgent: QueryAgent,
    private readonly dateProvider: DateProvider,
  ) {}

  async readLocalExpireByToken(token: string): Promise<Date> {
    const results = await this.queryAgent.query<SelectQueryResult<UserEntity>>(SQL_SELECT_EXIPRE, [
      token,
    ]);

    if (results.length < 1) {
      throw new UserNotFound();
    }

    const [user] = results;
    return user.expire;
  }

  async createUser(user: UserEntity): Promise<void> {
    await this.queryAgent.query<OkPacket>(SQL_INSERT_USER, [
      user.id,
      user.name,
      user.avatar,
      user.email,
      user.points,
      user.token,
      user.tokenExpire,
      user.expire,
    ]);
  }

  async updateTokenById(
    id: string,
    newToken: string,
    tokenExpire: Date,
    expire: Date,
  ): Promise<void> {
    const result = await this.queryAgent.query<OkPacket>(SQL_UPDATE_USER_TOKEN, [
      newToken,
      this.dateProvider.formatToDatabase(tokenExpire),
      this.dateProvider.formatToDatabase(expire),
      id,
    ]);

    if (result.affectedRows < 1) {
      throw new UserNotFound();
    }
  }

  async checkIdExistence(id: string): Promise<boolean> {
    const [result] = await this.queryAgent.query<SelectQueryResult<Counter>>(SQL_CHECK_ID_EXIST, [
      id,
    ]);
    return result.count < 1;
  }

  async readProfileById(id: string): Promise<ProfileEntity> {
    const results = await this.queryAgent.query<SelectQueryResult<UserSchema>>(SQL_SELECT_PROFILE, [
      id,
    ]);
    if (results.length < 1) {
      throw new UserNotFound();
    }

    const [user] = results;
    return {
      userId: id,
      name: user.name,
      avatar: user.avatar,
      points: user.points,
    };
  }
}
