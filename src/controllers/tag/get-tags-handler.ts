import { APIGatewayProxyResult } from 'aws-lambda';
import { RequestHandler } from '../interfaces/request-handler';
import { TagUsecase } from '../../services/tag/tag-usecase';
import { TagDto } from '../dtos/tag-dto';
import { GetTagsDto } from '../dtos/get-tags-dto';
import { ExtendedAPIGatewayProxyEvent } from '../interfaces/extended-api-gateway-proxy-event';
import { ResponseBuilder, HttpCode } from '../utils/response-builder';

export class GetTagsHandler implements RequestHandler {
  public constructor(private readonly tagUsecase: TagUsecase) {}

  public async handle(event: ExtendedAPIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const tagDtos = (await this.tagUsecase.readAll()) as TagDto[];
    const responseBody: GetTagsDto = { tags: tagDtos };
    return ResponseBuilder.setup()
      .setStatusCode(HttpCode.OK)
      .setBody(responseBody)
      .build();
  }
}
