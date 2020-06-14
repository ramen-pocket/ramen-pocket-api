import { UserEntity } from '../../entities/user-entity';
import { ProfileEntity } from '../../entities/profile-entity';
import { TokenInformationEntity } from '../../entities/token-information-entity';

export interface UserRepository {
  readLocalExpireByToken(token: string): Promise<TokenInformationEntity>;
  createUser(user: UserEntity): Promise<void>;
  updateTokenById(id: string, newToken: string, tokenExpire: Date, expire: Date): Promise<void>;
  checkIdExistence(id: string): Promise<boolean>;
  readProfileById(id: string): Promise<ProfileEntity>;
}
