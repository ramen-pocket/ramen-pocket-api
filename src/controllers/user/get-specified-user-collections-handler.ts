import { APIGatewayProxyResult } from 'aws-lambda';
import { CollectionUsecase } from '../../services/collection/collection-usecase';
import { CollectiveStoreUsecase } from '../../services/collective-store/collective-store-usecase';
import { RequestHandler } from '../interfaces/request-handler';
import { ExtendedAPIGatewayProxyEvent } from '../interfaces/extended-api-gateway-proxy-event';
import { StoreDto } from '../dtos/store-dto';
import { GetUserCollectionsDto } from '../dtos/get-user-collections-dto';
import { ResponseBuilder, HttpCode } from '../utils/response-builder';

export class GetSpecifiedUserCollectionsHandler implements RequestHandler {
  public constructor(
    private readonly collectionUsecase: CollectionUsecase,
    private readonly collectiveStoreUsecase: CollectiveStoreUsecase,
  ) {}

  async handle(event: ExtendedAPIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const { userId } = event.requestContext.authorizer;
    const { id } = event.pathParameters;
    const stores = await this.collectionUsecase.readStoresFromUserCollection(id);
    const collectiveStores = await this.collectiveStoreUsecase.tranfromToCollectiveStore(
      stores,
      userId,
    );

    const storeDtos: StoreDto[] = collectiveStores.map(StoreDto.transformFromCollectiveStoreEntity);
    const responseBody: GetUserCollectionsDto = { stores: storeDtos };
    return ResponseBuilder.setup()
      .setStatusCode(HttpCode.OK)
      .setBody(responseBody)
      .build();
  }
}
