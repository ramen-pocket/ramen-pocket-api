import { PolicyEffect } from './enum';

export interface Condition {
  [key: string]: {
    [key: string]: string;
  };
}

export interface Statement {
  Action: string;
  Effect: PolicyEffect;
  Resource: string[];
  Condition?: Condition;
}

export interface PolicyDocument {
  Version: string;
  Statement: Statement[];
}

export interface Policy {
  principalId: string;
  policyDocument: PolicyDocument;
}

export interface ApiOptions {
  restApiId: string;
  region: string;
  stage: string;
}

export interface MethodDescription {
  resourceArn: string;
  conditions: Condition;
}
