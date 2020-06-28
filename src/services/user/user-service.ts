import { UserRepository } from '../../repositories/user/user-repository';
import { ResourceNotFound } from '../../errors/service-error';
import { ProfileEntity } from '../../entities/profile-entity';
import { UserUsecase } from './user-usecase';
import { ThirdPartySignInProvider } from '../../providers/thrid-party-sign-in-provider/thrid-party-sign-in-provider';
import { DateProvider } from '../../providers/date-provider/date-provider';

const LOCAL_EXPIRE_DAYS = 30;

export class UserService implements UserUsecase {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly thirdPartySignInProvider: ThirdPartySignInProvider,
    private readonly dateProvider: DateProvider,
  ) {}

  async verifyIdentity(token: string): Promise<string> {
    try {
      const tokenInfo = await this.userRepository.readLocalExpireByToken(token);
      if (this.dateProvider.getUtc().valueOf() < tokenInfo.expire.valueOf()) {
        return tokenInfo.userId;
      }
    } catch (err) {
      if (!(err instanceof ResourceNotFound)) {
        throw err;
      }
    }

    const info = await this.thirdPartySignInProvider.verifyToken(token);
    const expire = this.dateProvider.addUtcDaysFromNow(LOCAL_EXPIRE_DAYS);
    if (await this.userRepository.checkIdExistence(info.userId)) {
      await this.userRepository.updateTokenById(info.userId, token, info.expire, expire);
    } else {
      await this.userRepository.createUser({
        id: info.userId,
        name: info.name,
        avatar: info.avatar,
        email: info.email,
        points: 0,
        token: token,
        tokenExpire: info.expire,
        expire: expire,
      });
    }

    return info.userId;
  }

  async checkIdExistence(id: string): Promise<boolean> {
    return this.userRepository.checkIdExistence(id);
  }

  async readProfile(id: string): Promise<ProfileEntity> {
    return this.userRepository.readProfileById(id);
  }
}
