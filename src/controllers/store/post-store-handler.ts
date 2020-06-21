import { APIGatewayProxyResult } from 'aws-lambda';
import { StoreUsecase } from '../../services/store/store-usecase';
import { RequestHandler } from '../interfaces/request-handler';
import { ExtendedAPIGatewayProxyEvent } from '../interfaces/extended-api-gateway-proxy-event';
import { ResponseBuilder, HttpCode } from '../utils/response-builder';
import { PostStoresBodyValidator } from './validators/post-stores-body-validator';

export class PostStoreHandler implements RequestHandler {
  public constructor(private readonly storeUsecase: StoreUsecase) {}

  public async handle(event: ExtendedAPIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const newStoreEntity = new PostStoresBodyValidator().validate(event.body);
    await this.storeUsecase.createOne(newStoreEntity);
    return ResponseBuilder.setup()
      .setStatusCode(HttpCode.Created)
      .build();
  }
}
