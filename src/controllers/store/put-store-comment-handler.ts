import { APIGatewayProxyResult } from 'aws-lambda';
import { CommentUsecase } from '../../services/comment/comment-usecase';
import { RequestHandler } from '../interfaces/request-handler';
import { ExtendedAPIGatewayProxyEvent } from '../interfaces/extended-api-gateway-proxy-event';
import { UpdatedCommentEntity } from '../../entities/updated-comment-entity';
import { IntegerValidator, IntegerValidatorConfig } from '../validators/integer-validator';
import { PutStoreCommentDto } from '../dtos/put-store-comment-dto';
import { PutStoreCommentBodyValidator } from './validators/put-store-comment-body-validator';
import { ResponseBuilder, HttpCode } from '../utils/response-builder';

const STORE_ID_VALIDATOR_CONFIG: IntegerValidatorConfig = {
  message: 'The parameter storeId must be an integer',
};

const COMMENT_ID_VALIDATOR_CONFIG: IntegerValidatorConfig = {
  message: 'The parameter commentId must be an integer',
};

export class PutStoreCommentHandler implements RequestHandler {
  public constructor(private readonly commentUsecase: CommentUsecase) {}

  public async handle(event: ExtendedAPIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const { userId } = event.requestContext.authorizer;
    const { storeId: rawStoreId, commentId: rawCommentId } = event.pathParameters;
    const storeId = new IntegerValidator(STORE_ID_VALIDATOR_CONFIG).validate(rawStoreId);
    const commentId = new IntegerValidator(COMMENT_ID_VALIDATOR_CONFIG).validate(rawCommentId);

    const putStoreCommentDto: PutStoreCommentDto = new PutStoreCommentBodyValidator().validate(
      event.body,
    );

    const updatedCommentEntity: UpdatedCommentEntity = {
      id: commentId,
      content: putStoreCommentDto.content,
      courses: putStoreCommentDto.courses,
      rate: putStoreCommentDto.rate,
    };

    await this.commentUsecase.updateOne(updatedCommentEntity);

    return ResponseBuilder.setup()
      .setStatusCode(HttpCode.OK)
      .build();
  }
}
