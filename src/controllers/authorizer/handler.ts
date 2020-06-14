import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda';
import { AuthorizationHandler } from '../interfaces/authorization-handler';
import { UserUsecase } from '../../services/user/user-usecase';
import { AwsArnComposition } from './aws-arn-composition';
import { ApiGatewayArnComposition } from './api-gateway-arn-composition';
import { AuthorityPolicyBuilder } from './authority-policy-builder';

export class AuthorizerHandler implements AuthorizationHandler {
  public constructor(private readonly userUsecase: UserUsecase) {}

  async handle(event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> {
    const token = event.authorizationToken;
    const principleId = await this.userUsecase.verifyIdentity(token);
    const awsArnComposition = new AwsArnComposition(event.methodArn);
    const apiGatewayArnComposition = new ApiGatewayArnComposition(awsArnComposition.resourceId);
    const authorityPolicyBuilder = new AuthorityPolicyBuilder(
      principleId,
      awsArnComposition.accountId,
      {
        region: awsArnComposition.region,
        restApiId: apiGatewayArnComposition.apiId,
        stage: apiGatewayArnComposition.stage,
      },
    );

    authorityPolicyBuilder.allowAllMethods();

    const response: CustomAuthorizerResult = authorityPolicyBuilder.build();
    response.context = { userId: principleId };

    return response;
  }
}
