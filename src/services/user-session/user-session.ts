import { Role } from '../user/role';

export class UserSessionData {
  constructor(public readonly role: Role, public readonly userId?: string) {}

  public clone(): UserSessionData {
    return new UserSessionData(this.role, this.userId);
  }
}

export interface UserSessionWriable {
  setSessionData(data: UserSessionData): void;
}

export interface UserSessionReadable {
  getSessionData(): UserSessionData;
}

export class UserSession implements UserSessionWriable, UserSessionReadable {
  private userSessionData: UserSessionData;

  public setSessionData(data: UserSessionData) {
    this.userSessionData = data;
  }

  public getSessionData(): UserSessionData {
    return this.userSessionData.clone();
  }
}
