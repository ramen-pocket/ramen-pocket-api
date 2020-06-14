import { APIGatewayProxyResult } from 'aws-lambda';

interface Headers {
  [key: string]: boolean | number | string;
}

export enum HttpCode {
  OK = 200,
  Created = 201,
  Accepted = 202,
  NonAuthoritativeInformation = 203,
  NoContent = 204,
  BadRequest = 400,
  Unauthorized = 401,
  PaymentRequired = 402,
  Forbidden = 403,
  NotFound = 404,
  Conflict = 409,
}

export enum HeaderTypes {
  ContentType = 'Content-Type',
}

export enum ContentTypes {
  TextPlain = 'text/plain',
  ApplicationJson = 'application/json',
}

export class ResponseBuilder {
  private statusCode: HttpCode;
  private headers: Headers;
  private body: string;

  public static setup(): ResponseBuilder {
    return new ResponseBuilder();
  }

  public static createNoContent(): APIGatewayProxyResult {
    return {
      statusCode: HttpCode.NoContent,
      headers: {
        [HeaderTypes.ContentType]: ContentTypes.TextPlain,
      },
      body: '',
    };
  }

  public static createBadRequest(reason: string = 'bad request'): APIGatewayProxyResult {
    return {
      statusCode: HttpCode.BadRequest,
      headers: {
        [HeaderTypes.ContentType]: ContentTypes.ApplicationJson,
      },
      body: JSON.stringify({ reason }),
    };
  }

  public static createUnauthorized(reason: string = 'unauthorized'): APIGatewayProxyResult {
    return {
      statusCode: HttpCode.Unauthorized,
      headers: {
        [HeaderTypes.ContentType]: ContentTypes.ApplicationJson,
      },
      body: JSON.stringify({ reason }),
    };
  }

  public static createForbidden(reason: string = 'forbidden'): APIGatewayProxyResult {
    return {
      statusCode: HttpCode.Forbidden,
      headers: {
        [HeaderTypes.ContentType]: ContentTypes.ApplicationJson,
      },
      body: JSON.stringify({ reason }),
    };
  }

  public static createNotFound(reason: string = 'not found'): APIGatewayProxyResult {
    return {
      statusCode: HttpCode.NotFound,
      headers: {
        [HeaderTypes.ContentType]: ContentTypes.ApplicationJson,
      },
      body: JSON.stringify({ reason }),
    };
  }

  public static createConflict(reason: string = 'conflict'): APIGatewayProxyResult {
    return {
      statusCode: HttpCode.Conflict,
      headers: {
        [HeaderTypes.ContentType]: ContentTypes.ApplicationJson,
      },
      body: JSON.stringify({ reason }),
    };
  }

  public constructor(statusCode: HttpCode = HttpCode.OK) {
    this.statusCode = statusCode;
    this.headers = { [HeaderTypes.ContentType]: ContentTypes.TextPlain };
    this.body = '';
  }

  public setStatusCode(statusCode: HttpCode): ResponseBuilder {
    this.statusCode = statusCode;
    return this;
  }

  public setHeader(key: string, value: boolean | number | string): ResponseBuilder {
    this.headers[key] = value;
    return this;
  }

  public setBody(value: string | number | boolean | Object): ResponseBuilder {
    switch (typeof value) {
      case 'string':
        this.body = value as string;
      case 'number':
        this.headers[HeaderTypes.ContentType] = ContentTypes.TextPlain;
        this.body = JSON.stringify(value);
      case 'boolean':
        this.headers[HeaderTypes.ContentType] = ContentTypes.TextPlain;
        this.body = JSON.stringify(value);
      case 'object':
        this.headers[HeaderTypes.ContentType] = ContentTypes.ApplicationJson;
        this.body = JSON.stringify(value);
    }
    return this;
  }

  public build(): APIGatewayProxyResult {
    return {
      statusCode: this.statusCode,
      headers: this.headers,
      body: this.body,
    };
  }
}
