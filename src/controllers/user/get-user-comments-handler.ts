import { APIGatewayProxyResult } from 'aws-lambda';
import { CommentUsecase } from '../../services/comment/comment-usecase';
import { CollectiveStoreUsecase } from '../../services/collective-store/collective-store-usecase';
import { RequestHandler } from '../interfaces/request-handler';
import { ExtendedAPIGatewayProxyEvent } from '../interfaces/extended-api-gateway-proxy-event';
import { StoreDto } from '../dtos/store-dto';
import { CommentDto } from '../dtos/comment-dto';
import { StoreCommentGroupDto } from '../dtos/store-comment-group-dto';
import { GetUserCommentsDto } from '../dtos/get-user-comments-dto';
import { ResponseBuilder, HttpCode } from '../utils/response-builder';

export class GetUserCommentsHandler implements RequestHandler {
  public constructor(
    private readonly commentUsecase: CommentUsecase,
    private readonly collectiveStoreUsecase: CollectiveStoreUsecase,
  ) {}

  public async handle(event: ExtendedAPIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const { userId } = event.requestContext.authorizer;
    const storeCommentGroupEntities = await this.commentUsecase.readManyGroupedByStoreByUserId(
      userId,
    );

    const storeEntities = storeCommentGroupEntities.map((item) => item.store);
    const collectiveStoreEntities = await this.collectiveStoreUsecase.tranfromToCollectiveStore(
      storeEntities,
      userId,
    );

    const storeCommentGroupDto: StoreCommentGroupDto[] = storeCommentGroupEntities.map(
      (item, index) => ({
        store: StoreDto.transformFromCollectiveStoreEntity(collectiveStoreEntities[index]),
        records: item.comments.map(CommentDto.transformFromCommentEntity),
      }),
    );

    const responseBody: GetUserCommentsDto = { comments: storeCommentGroupDto };
    return ResponseBuilder.setup()
      .setStatusCode(HttpCode.OK)
      .setBody(responseBody)
      .build();
  }
}
