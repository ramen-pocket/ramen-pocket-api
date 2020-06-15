import { APIGatewayProxyResult } from 'aws-lambda';
import { RequestHandler } from '../interfaces/request-handler';
import { CollectionUsecase } from '../../services/collection/collection-usecase';
import { ExtendedAPIGatewayProxyEvent } from '../interfaces/extended-api-gateway-proxy-event';
import { IntegerValidator } from '../validators/integer-validator';
import { ResponseBuilder, HttpCode } from '../utils/response-builder';

const STORE_ID_VALIDATION_FAILURE_MESSAGE = 'The path parameter storeId must be an integer';

export class PostUserCollectionHandler implements RequestHandler {
  public constructor(private readonly collectionUsecase: CollectionUsecase) {}

  public async handle(event: ExtendedAPIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const { userId } = event.requestContext.authorizer;
    const { storeId: rawStoreId } = event.pathParameters;
    const storeId = new IntegerValidator(STORE_ID_VALIDATION_FAILURE_MESSAGE).validate(rawStoreId);
    await this.collectionUsecase.addStoreToUserCollection(userId, storeId);

    return ResponseBuilder.setup()
      .setStatusCode(HttpCode.Created)
      .build();
  }
}
