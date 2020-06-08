import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda';
import { Authorizer } from './authenticator';
import { AwsArnComposition } from './aws-arn-composition';
import { ApiGatewayArnComposition } from './api-gateway-arn-composition';
import { AuthorityPolicyBuilder } from './authority-policy-builder';

const { GOOGLE_CLIENT_ID } = process.env;

export default async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  console.log(`Method ARN: ${event.methodArn}`);

  const { authorizationToken } = event;
  const token = authorizationToken;

  // ===== Verify the token =====
  let principalId: string;
  const authenticator = new Authorizer(GOOGLE_CLIENT_ID);

  try {
    await authenticator.connectToDatabase();

    if (
      !(await authenticator.verifyLocally(token)) &&
      !(await authenticator.verifyByGoogle(token))
    ) {
      throw new Error('Unauthorized');
    } else {
      principalId = authenticator.getUserId();
    }
  } catch (err) {
    console.log(`Error in index.default:`);
    console.log(err);

    throw err;
  } finally {
    await authenticator.disconnectToDatabase();
  }

  // ===== Generate policy =====
  const awsArnComposition = new AwsArnComposition(event.methodArn);
  const apiGatewayArnComposition = new ApiGatewayArnComposition(awsArnComposition.resourceId);
  const authorityPolicyBuilder = new AuthorityPolicyBuilder(
    principalId,
    awsArnComposition.accountId,
    {
      region: awsArnComposition.region,
      restApiId: apiGatewayArnComposition.apiId,
      stage: apiGatewayArnComposition.stage,
    },
  );

  authorityPolicyBuilder.allowAllMethods();

  const response: CustomAuthorizerResult = authorityPolicyBuilder.build();
  response.context = { userId: principalId };

  return response;
};