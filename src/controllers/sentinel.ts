import { APIGatewayProxyResult } from 'aws-lambda';
import { ResponseBuilder } from './utils/response-builder';

import {
  ServiceError,
  UserTokenExpired,
  InvalidSignInToken,
  ResourceNotFound,
  ResourceCreationConflict,
} from '../errors/service-error';

import { ValidationError } from '../errors/validation-error';

async function handleServcieError(error: ServiceError): Promise<APIGatewayProxyResult> {
  switch (error.constructor) {
    case ResourceNotFound:
      return ResponseBuilder.createNotFound(error.code);
    case UserTokenExpired:
    case InvalidSignInToken:
      return ResponseBuilder.createUnauthorized(error.code);
    case ResourceCreationConflict:
      return ResponseBuilder.createConflict(error.code);
  }
}

async function handleValidationError(error: ValidationError): Promise<APIGatewayProxyResult> {
  return ResponseBuilder.createBadRequest(error.code);
}

export async function handleError(error: Error): Promise<APIGatewayProxyResult> {
  if (error instanceof ServiceError) {
    return handleServcieError(error);
  } else if (error instanceof ValidationError) {
    return handleValidationError(error);
  } else {
    throw error;
  }
}
