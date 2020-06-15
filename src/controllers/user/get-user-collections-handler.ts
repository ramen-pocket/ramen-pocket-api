import { APIGatewayProxyResult } from 'aws-lambda';
import { RequestHandler } from '../interfaces/request-handler';
import { CollectionUsecase } from '../../services/collection/collection-usecase';
import { ExtendedAPIGatewayProxyEvent } from '../interfaces/extended-api-gateway-proxy-event';
import { StoreDto } from '../dtos/store-dto';
import { ResponseBuilder, HttpCode } from '../utils/response-builder';

export class GetUserCollectionsHandler implements RequestHandler {
  public constructor(private readonly collectionUsecase: CollectionUsecase) {}

  public async handle(event: ExtendedAPIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const { userId } = event.requestContext.authorizer;
    const stores = await this.collectionUsecase.readStoresFromUserCollection(userId);
    const collectiveStores: StoreDto[] = stores.map((store) =>
      StoreDto.transformFromStoreEntity(store, true),
    );

    return ResponseBuilder.setup()
      .setStatusCode(HttpCode.OK)
      .setBody(collectiveStores)
      .build();
  }
}
