import { APIGatewayProxyResult } from 'aws-lambda';
import { RequestHandler } from '../interfaces/request-handler';
import { CollectionUsecase } from '../../services/collection/collection-usecase';
import { ExtendedAPIGatewayProxyEvent } from '../interfaces/extended-api-gateway-proxy-event';
import { IntegerValidator, IntegerValidatorConfig } from '../validators/integer-validator';
import { ResponseBuilder } from '../utils/response-builder';

const INT_VALIDATOR_CONFIG: IntegerValidatorConfig = {
  message: 'The parameter storeId must be an integer.',
};

export class DeleteUserCollectionHandler implements RequestHandler {
  public constructor(private readonly collectionUsecase: CollectionUsecase) {}

  public async handle(event: ExtendedAPIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const { userId } = event.requestContext.authorizer;
    const { storeId: rawStoreId } = event.pathParameters;
    const storeId = new IntegerValidator(INT_VALIDATOR_CONFIG).validate(rawStoreId);
    await this.collectionUsecase.deleteStoreFromUserCollection(userId, storeId);
    return ResponseBuilder.createNoContent();
  }
}
