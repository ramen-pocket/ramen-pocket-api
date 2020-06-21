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

const LIMIT_VALIDATOR_CONDIG: IntegerValidatorConfig = {
  message: 'The query parameter limit must be a positive integer.',
  minimum: {
    value: 1,
    message: 'The value of the query parameter must be greater than or equal to 1.',
  },
  maximum: {
    value: 50,
    message: 'The value of the query parameter must be less than or equal to 50.',
  },
};

const SKIP_VALIDATOR_CONFIG: IntegerValidatorConfig = {
  message: 'The query parameter skip must be a positive integer or zero.',
  minimum: {
    value: 0,
    message: 'The value of the query parameter must be greater than or equal to 0.',
  },
};

const DEFAULT_RAW_LIMIT_VALUE = '10';
const DEFAULT_RAW_SKIP_VALUE = '0';

export class GetStoreCommentsHandler implements RequestHandler {
  public constructor(private readonly commentUsecase: CommentUsecase) {}

  public async handle(event: ExtendedAPIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const { storeId: rawStoreId } = event.pathParameters;
    const queryParameters = event.queryStringParameters || {};
    const rawLimit = queryParameters.limit || DEFAULT_RAW_LIMIT_VALUE;
    const rawSkip = queryParameters.skip || DEFAULT_RAW_SKIP_VALUE;

    const limit = new IntegerValidator(LIMIT_VALIDATOR_CONDIG).validate(rawLimit);
    const skip = new IntegerValidator(SKIP_VALIDATOR_CONFIG).validate(rawSkip);
    const storeId = new IntegerValidator(STORE_ID_VALIDATOR_CONFIG).validate(rawStoreId);

    const userProfileCommentGroupEntities = await this.commentUsecase.readManyGroupedByUserByStoreId(
      storeId,
      limit,
      skip,
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
