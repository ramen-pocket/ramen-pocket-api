import { APIGatewayProxyResult } from 'aws-lambda';
import { CommentUsecase } from '../../services/comment/comment-usecase';
import { ExtendedAPIGatewayProxyEvent } from '../interfaces/extended-api-gateway-proxy-event';
import { RequestHandler } from '../interfaces/request-handler';
import { IntegerValidator, IntegerValidatorConfig } from '../validators/integer-validator';
import { ResponseBuilder } from '../utils/response-builder';

const STORE_ID_VALIDATOR_CONFIG: IntegerValidatorConfig = {
  message: 'The parameter storeId must be an integer',
};

const COMMENT_ID_VALIDATOR_CONFIG: IntegerValidatorConfig = {
  message: 'The parameter commentId must be an integer',
};

export class DeleteStoreCommentHandler implements RequestHandler {
  public constructor(private readonly commentUsecase: CommentUsecase) {}

  public async handle(event: ExtendedAPIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const { userId } = event.requestContext.authorizer;
    const { storeId: rawStoreId, commentId: rawCommentId } = event.pathParameters;
    const storeId = new IntegerValidator(STORE_ID_VALIDATOR_CONFIG).validate(rawStoreId);
    const commentId = new IntegerValidator(COMMENT_ID_VALIDATOR_CONFIG).validate(rawCommentId);
    await this.commentUsecase.deleteOne(commentId, userId, storeId);
    return ResponseBuilder.createNoContent();
  }
}
