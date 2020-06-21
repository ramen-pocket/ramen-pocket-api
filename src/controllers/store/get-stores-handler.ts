import { APIGatewayProxyResult } from 'aws-lambda';
import { StoreUsecase } from '../../services/store/store-usecase';
import { CollectiveStoreUsecase } from '../../services/collective-store/collective-store-usecase';
import { RequestHandler } from '../interfaces/request-handler';
import { StoreDto } from '../dtos/store-dto';
import { GetStoresDto } from '../dtos/get-stores-dto';
import { ExtendedAPIGatewayProxyEvent } from '../interfaces/extended-api-gateway-proxy-event';
import { IntegerValidator, IntegerValidatorConfig } from '../validators/integer-validator';
import { ResponseBuilder, HttpCode } from '../utils/response-builder';

const QUERY_LIMIT_VALIDATOR_CONFIG: IntegerValidatorConfig = {
  message: 'The query parameter limit must be an integer',
  minimum: {
    value: 1,
    message: 'The value of the query parameter limit must be greater than or equal to 1',
  },
  maximum: {
    value: 100,
    message: 'The value of the query parameter limit must be less than or equal to 100',
  },
};

const QUERY_SKIP_VALIDATOR_CONFIG: IntegerValidatorConfig = {
  message: 'The query parameter skip must be an integer',
  minimum: {
    value: 0,
    message: 'The value of the query parameter skip must be greater than or equal to 0',
  },
  maximum: {
    value: 65535,
    message: 'The value of the query parameter skip must be less than or equal to 65535',
  },
};

const DEFAULT_QUERY_LIMIT_VALUE = '10';
const DEFAULT_QUERY_SKIP_VALUE = '0';

export class GetStoresHandler implements RequestHandler {
  public constructor(
    private readonly storeUsecase: StoreUsecase,
    private readonly collectiveStoreUsecase: CollectiveStoreUsecase,
  ) {}

  public async handle(event: ExtendedAPIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const { userId } = event.requestContext.authorizer;
    const queryParameters = event.queryStringParameters || {};
    const rawLimit = queryParameters.limit;
    const rawSkip = queryParameters.skip;

    const limit = new IntegerValidator(QUERY_LIMIT_VALIDATOR_CONFIG).validate(
      rawLimit || DEFAULT_QUERY_LIMIT_VALUE,
    );

    const skip = new IntegerValidator(QUERY_SKIP_VALIDATOR_CONFIG).validate(
      rawSkip || DEFAULT_QUERY_SKIP_VALUE,
    );

    const storeEntities = await this.storeUsecase.readMany(limit, skip);
    const collectiveStoreEntities = await this.collectiveStoreUsecase.tranfromToCollectiveStore(
      storeEntities,
      userId,
    );

    const storeDtos = collectiveStoreEntities.map(StoreDto.transformFromCollectiveStoreEntity);
    const responseBody: GetStoresDto = { stores: storeDtos };
    return ResponseBuilder.setup()
      .setStatusCode(HttpCode.OK)
      .setBody(responseBody)
      .build();
  }
}
