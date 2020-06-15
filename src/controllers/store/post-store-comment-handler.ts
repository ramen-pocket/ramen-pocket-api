import { APIGatewayProxyResult } from 'aws-lambda';
import { RequestHandler } from '../interfaces/request-handler';
import { NewCommentEntity } from '../../entities/new-comment-entity';
import { CommentUsecase } from '../../services/comment/comment-usecase';
import { PostStoreCommentBodyValidator } from './validators/post-store-comment-body-validator';
import { IntegerValidator, IntegerValidatorConfig } from '../validators/integer-validator';
import { ResponseBuilder, HttpCode } from '../utils/response-builder';
import { ExtendedAPIGatewayProxyEvent } from '../interfaces/extended-api-gateway-proxy-event';
import { PostStoreCommentDto } from '../dtos/post-store-comment-dto';

const STORE_ID_VALIDATOR_CONFIG: IntegerValidatorConfig = {
  message: 'The path parameter must be an integer.',
};

export class PostStoreCommentHandler implements RequestHandler {
  public constructor(private readonly commentUsecase: CommentUsecase) {}

  public async handle(event: ExtendedAPIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const { userId } = event.requestContext.authorizer;
    const { storeId: rawStoreId } = event.pathParameters;
    const storeId = new IntegerValidator(STORE_ID_VALIDATOR_CONFIG).validate(rawStoreId);
    const postStoreCommentDto: PostStoreCommentDto = new PostStoreCommentBodyValidator().validate(
      event.body,
    );

    const newCommentEntity: NewCommentEntity = {
      userId: userId,
      storeId: storeId,
      ...postStoreCommentDto,
    };

    await this.commentUsecase.createOne(newCommentEntity);
    return ResponseBuilder.setup()
      .setStatusCode(HttpCode.Created)
      .build();
  }
}
