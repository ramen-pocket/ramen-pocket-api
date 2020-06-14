import { APIGatewayProxyResult } from 'aws-lambda';
import { UserUsecase } from '../../services/user/user-usecase';
import { ExtendedAPIGatewayProxyEvent } from '../interfaces/extended-api-gateway-proxy-event';
import { RequestHandler } from '../interfaces/request-handler';
import { ProfileDto } from '../dtos/profile-dto';
import { ResponseBuilder, HttpCode } from '../utils/response-builder';

export class GetUserProfileHandler implements RequestHandler {
  public constructor(public readonly userUsecase: UserUsecase) {}

  public async handle(event: ExtendedAPIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const { userId } = event.requestContext.authorizer;
    const profile: ProfileDto = await this.userUsecase.readProfile(userId);
    return ResponseBuilder.setup()
      .setStatusCode(HttpCode.OK)
      .setBody(profile)
      .build();
  }
}
