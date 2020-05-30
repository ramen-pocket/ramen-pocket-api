export class AwsArnComposition {
  public static readonly SNIPPET_SPLITER = ':';
  public static readonly NUMBER_OF_SNIPPETS = 6;
  public static readonly ARN_IDENTIFIER_INDEX = 0;
  public static readonly PARTITION_INDEX = 1;
  public static readonly SERVICE_INDEX = 2;
  public static readonly REGION_INDEX = 3;
  public static readonly ACCOUNT_ID_INDEX = 4;
  public static readonly RESOURCE_ID_INDEX = 5;

  public readonly arnIdentifier: string;
  public readonly partition: string;
  public readonly service: string;
  public readonly region: string;
  public readonly accountId: string;
  public readonly resourceId: string;

  public constructor(raw: string) {
    const snippets = raw.split(AwsArnComposition.SNIPPET_SPLITER);

    if (snippets.length !== AwsArnComposition.NUMBER_OF_SNIPPETS) {
      throw new Error('The format of the ARN string is incorrect.');
    }

    this.arnIdentifier = snippets[AwsArnComposition.ARN_IDENTIFIER_INDEX];
    this.partition = snippets[AwsArnComposition.PARTITION_INDEX];
    this.service = snippets[AwsArnComposition.SERVICE_INDEX];
    this.region = snippets[AwsArnComposition.REGION_INDEX];
    this.accountId = snippets[AwsArnComposition.ACCOUNT_ID_INDEX];
    this.resourceId = snippets[AwsArnComposition.RESOURCE_ID_INDEX];
  }
}
