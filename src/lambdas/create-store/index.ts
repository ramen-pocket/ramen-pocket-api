import { APIGatewayProxyResult } from 'aws-lambda';
import { ExtendedAPIGatewayProxyEvent } from '../../interfaces/extended-api-gateway-proxy-event';
import { ResponseBuilder, HttpCode } from '../../utils/response-builder';
import { DatabaseConnection } from '../../utils/database-connection';
import { validateBody, StoreDto } from './validation';
import { StoreCreator } from './store-creator';

export default async (event: ExtendedAPIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  let success: boolean, storeDto: StoreDto, errorMsg: string;
  [success, storeDto] = validateBody(event.body);
  if (!success) {
    return ResponseBuilder.createBadRequest('Incorrect Body Format.');
  }

  const connection = new DatabaseConnection();
  try {
    await connection.connect();
    const storeCreator = new StoreCreator(connection);
    [success, errorMsg] = await storeCreator.create(storeDto);
    if (!success) {
      return ResponseBuilder.createNotFound(errorMsg);
    }

    return ResponseBuilder.setup()
      .setStatusCode(HttpCode.Created)
      .build();
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    await connection.disconnect();
  }
};
