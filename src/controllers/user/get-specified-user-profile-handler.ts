import { APIGatewayProxyResult } from 'aws-lambda';
import { UserUsecase } from '../../services/user/user-usecase';
import { ExtendedAPIGatewayProxyEvent } from '../interfaces/extended-api-gateway-proxy-event';
import { RequestHandler } from '../interfaces/request-handler';
import { ProfileDto } from '../dtos/profile-dto';
import { ResponseBuilder, HttpCode } from '../utils/response-builder';

export class GetSpecifiedUserProfileHandler implements RequestHandler {
  public constructor(private readonly userUsecase: UserUsecase) {}

  async handle(event: ExtendedAPIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const { id } = event.pathParameters;
    const profile: ProfileDto = await this.userUsecase.readProfile(id);
    return ResponseBuilder.setup()
      .setStatusCode(HttpCode.OK)
      .setBody(profile)
      .build();
  }
}
