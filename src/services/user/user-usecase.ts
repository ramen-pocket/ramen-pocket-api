import { ProfileEntity } from '../../entities/profile-entity';

export interface UserUsecase {
  verifyIdentity(token: string): Promise<void>;
  checkIdExistence(id: string): Promise<boolean>;
  readProfile(id: string): Promise<ProfileEntity>;
}
