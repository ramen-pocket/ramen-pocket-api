export class ApiGatewayArnComposition {
  public static readonly SNIPPET_SPLITER = '/';
  public static readonly LEAST_NUMBER_OF_SNIPPETS = 4;
  public static readonly API_ID_INDEX = 0;
  public static readonly STAGE_INDEX = 1;
  public static readonly HTTP_VERB_INDEX = 2;
  public static readonly RESOURCE_INDEX = 3;

  public readonly apiId: string;
  public readonly stage: string;
  public readonly httpVerb: string;
  public readonly resource: string;

  public constructor(raw: string) {
    const snippets = raw.split(ApiGatewayArnComposition.SNIPPET_SPLITER);

    if (snippets.length < ApiGatewayArnComposition.LEAST_NUMBER_OF_SNIPPETS) {
      throw new Error('The format of the API Gateway ARN string is incorrect.');
    }

    this.apiId = snippets[ApiGatewayArnComposition.API_ID_INDEX];
    this.stage = snippets[ApiGatewayArnComposition.STAGE_INDEX];
    this.httpVerb = snippets[ApiGatewayArnComposition.HTTP_VERB_INDEX];

    const resourceSnippets = snippets.slice(ApiGatewayArnComposition.RESOURCE_INDEX);
    this.resource = '/' + resourceSnippets.join(ApiGatewayArnComposition.SNIPPET_SPLITER);
  }
}
