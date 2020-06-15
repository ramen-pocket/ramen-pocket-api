import { APIGatewayProxyResult } from 'aws-lambda';
import { CommentUsecase } from '../../services/comment/comment-usecase';
import { RequestHandler } from '../interfaces/request-handler';
import { ExtendedAPIGatewayProxyEvent } from '../interfaces/extended-api-gateway-proxy-event';
import { CommentDto } from '../dtos/comment-dto';
import { ProfileDto } from '../dtos/profile-dto';
import { UserCommentsGroupDto } from '../dtos/user-comments-group-dto';
import { GetStoreCommentsDto } from '../dtos/get-store-comments-dto';
import { IntegerValidator, IntegerValidatorConfig } from '../validators/integer-validator';
import { ResponseBuilder } from '../utils/response-builder';
import { HttpCode } from '../../utils/response-builder';

const STORE_ID_VALIDATOR_CONFIG: IntegerValidatorConfig = {
  message: 'The path parameter storeId must be an integer',
};

export class GetStoreCommentsHandler implements RequestHandler {
  public constructor(private readonly commentUsecase: CommentUsecase) {}

  public async handle(event: ExtendedAPIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const { storeId: rawStoreId } = event.pathParameters;
    const storeId = new IntegerValidator(STORE_ID_VALIDATOR_CONFIG).validate(rawStoreId);
    const userProfileCommentGroupEntities = await this.commentUsecase.readManyGroupedByUserByStoreId(
      storeId,
    );

    const userCommentsGroupDtos: UserCommentsGroupDto[] = userProfileCommentGroupEntities.map(
      (item) => ({
        user: item.userProfile as ProfileDto,
        records: item.comments.map(CommentDto.transformFromCommentEntity),
      }),
    );

    const responseBody: GetStoreCommentsDto = { comments: userCommentsGroupDtos };
    return ResponseBuilder.setup()
      .setStatusCode(HttpCode.OK)
      .setBody(responseBody)
      .build();
  }
}
