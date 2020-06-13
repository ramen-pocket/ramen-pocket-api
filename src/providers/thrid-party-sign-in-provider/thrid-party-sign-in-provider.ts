import { SignInInformationDto } from './sign-in-information-dto';

/**
 *  Functions provided by a trusted thrid-party sign-in service provider.
 */
export interface ThirdPartySignInProvider {
  /**
   * Verify whether or not a token is valid and return its expire time in an integer.
   * @param token The token to examine.
   * @return The expire time. If the token is invalid, the expire will be `-1`.
   */
  verifyToken(token: string): Promise<SignInInformationDto>;
}
