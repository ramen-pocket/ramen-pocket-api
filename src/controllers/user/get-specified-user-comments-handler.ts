import { APIGatewayProxyResult } from 'aws-lambda';
import { CommentUsecase } from '../../services/comment/comment-usecase';
import { CollectiveStoreUsecase } from '../../services/collective-store/collective-store-usecase';
import { StoreDto } from '../dtos/store-dto';
import { CommentDto } from '../dtos/comment-dto';
import { StoreCommentGroupDto } from '../dtos/store-comment-group-dto';
import { GetUserCommentsDto } from '../dtos/get-user-comments-dto';
import { RequestHandler } from '../interfaces/request-handler';
import { ResponseBuilder, HttpCode } from '../utils/response-builder';
import { ExtendedAPIGatewayProxyEvent } from '../interfaces/extended-api-gateway-proxy-event';

export class GetSpecifiedUserCommentsHandler implements RequestHandler {
  public constructor(
    private readonly commentUsecase: CommentUsecase,
    private readonly collectiveStoreUsecase: CollectiveStoreUsecase,
  ) {}

  public async handle(event: ExtendedAPIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const { userId } = event.requestContext.authorizer;
    const { id } = event.pathParameters;
    const storeCommentGroupEntities = await this.commentUsecase.readManyGroupedByStoreByUserId(id);
    const storeEntities = storeCommentGroupEntities.map((item) => item.store);
    const collectiveStoreEntities = await this.collectiveStoreUsecase.tranfromToCollectiveStore(
      storeEntities,
      userId,
    );

    const storeCommentGroupDtos: StoreCommentGroupDto[] = storeCommentGroupEntities.map(
      (item, index) => ({
        store: StoreDto.transformFromCollectiveStoreEntity(collectiveStoreEntities[index]),
        records: item.comments.map(CommentDto.transformFromCommentEntity),
      }),
    );

    const responseBody: GetUserCommentsDto = { comments: storeCommentGroupDtos };
    return ResponseBuilder.setup()
      .setStatusCode(HttpCode.OK)
      .setBody(responseBody)
      .build();
  }
}
