import { OAuth2Client } from 'google-auth-library';
import { InvalidSignInToken } from '../../errors/service-error';
import { DateProvider } from '../date-provider/date-provider';
import { ThirdPartySignInProvider } from './thrid-party-sign-in-provider';
import { SignInInformationDto } from './sign-in-information-dto';

export class GoogleSignInProvider implements ThirdPartySignInProvider {
  private readonly clientId: string;
  private readonly client: OAuth2Client;
  private readonly dateProvider: DateProvider;

  constructor(clientId: string, dateProvider: DateProvider) {
    this.clientId = clientId;
    this.client = new OAuth2Client(clientId);
    this.dateProvider = dateProvider;
  }

  async verifyToken(token: string): Promise<SignInInformationDto> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: this.clientId,
      });

      const payload = ticket.getPayload();
      const userId = payload.sub;
      const expire = payload.exp;

      return {
        userId: userId,
        name: payload.name,
        email: payload.email,
        avatar: payload.picture,
        expire: this.dateProvider.getUnix(expire),
      };
    } catch (err) {
      throw new InvalidSignInToken();
    }
  }
}
