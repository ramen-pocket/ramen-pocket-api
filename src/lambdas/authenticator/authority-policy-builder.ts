import { HttpVerb, PolicyEffect } from './enum';
import {
  MethodDescription,
  ApiOptions,
  Condition,
  Statement,
  Policy,
  PolicyDocument,
} from './interfaces';

export class AuthorityPolicyBuilder {
  private static readonly VERSION = '2012-10-17';
  private static readonly PATH_REGEX = new RegExp('^[/.a-zA-Z0-9-*]+$');

  private static readonly RESOURCE_ARN_PREFIX = 'arn:aws:execute-api:';
  private static readonly STATEMENT_ACTION = 'execute-api:Invoke';

  private awsAccountId: string;
  private principalId: string;
  private allowMethods: MethodDescription[];
  private denyMethods: MethodDescription[];

  private restApiId: string;
  private region: string;
  private stage: string;

  public constructor(principal: string, awsAccountId: string, apiOptions?: ApiOptions) {
    this.awsAccountId = awsAccountId;
    this.principalId = principal;
    this.allowMethods = [];
    this.denyMethods = [];

    if (!apiOptions || !apiOptions.restApiId) {
      this.restApiId = '*';
    } else {
      this.restApiId = apiOptions.restApiId;
    }

    if (!apiOptions || !apiOptions.region) {
      this.region = '*';
    } else {
      this.region = apiOptions.region;
    }

    if (!apiOptions || !apiOptions.stage) {
      this.stage = '*';
    } else {
      this.stage = apiOptions.stage;
    }
  }

  /**
   * Adds a method to the internal lists of allowed or denied methods. Each object in
   * the internal list contains a resource ARN and a condition statement. The condition
   * statement can be null.
   *
   * @method addMethod
   * @param effect The effect for the policy. This can only be "Allow" or "Deny".
   * @param verb The HTTP verb for the method, this should ideally come from the
   *                 AuthPolicy.HttpVerb object to avoid spelling mistakes
   * @param HttpVerb The resource path. For example "/pets"
   * @param resource The conditions object in the format specified by the AWS docs.
   */
  private addMethod(effect: PolicyEffect, verb: HttpVerb, resource: string, conditions: Condition) {
    if (AuthorityPolicyBuilder.PATH_REGEX.test(resource)) {
      throw new Error(
        `Invalid resource path: ${resource}. Path should match ${AuthorityPolicyBuilder.PATH_REGEX}`,
      );
    }

    // Remove the leading slash if it exists.
    let cleanedResource = resource;
    if (resource.substring(0, 1) == '/') {
      cleanedResource = resource.substring(1, resource.length);
    }

    let resourceArn =
      AuthorityPolicyBuilder.RESOURCE_ARN_PREFIX +
      this.region +
      ':' +
      this.awsAccountId +
      ':' +
      this.restApiId +
      '/' +
      this.stage +
      '/' +
      verb +
      '/' +
      cleanedResource;

    if (effect === PolicyEffect.Allow) {
      this.allowMethods.push({
        resourceArn,
        conditions,
      });
    } else if (effect === PolicyEffect.Deny) {
      this.denyMethods.push({
        resourceArn,
        conditions,
      });
    }
  }

  /**
   * Returns an empty statement object prepopulated with the correct action and the
   * desired effect.
   *
   * @method getEmptyStatement
   * @param effect The effect of the statement, this can be "Allow" or "Deny"
   * @return An empty statement object with the Action, Effect, and Resource
   *         properties prepopulated.
   */
  private getEmptyStatement(effect: PolicyEffect): Statement {
    return {
      Action: AuthorityPolicyBuilder.STATEMENT_ACTION,
      Effect: effect,
      Resource: [],
      Condition: null,
    };
  }

  /**
   * This function loops over an array of objects containing a resourceArn and
   * conditions statement and generates the array of statements for the policy.
   *
   * @method getStatementsForEffect
   * @param effect The desired effect. This can be "Allow" or "Deny"
   * @param methods An array of method objects containing the ARN of the resource
   *                and the conditions for the policy
   * @return An array of formatted statements for the policy.
   */
  private getStatementsForEffect(effect: PolicyEffect, methods: MethodDescription[]): Statement[] {
    const statements: Statement[] = [];

    if (methods.length <= 0) {
      return statements;
    }

    const statement = this.getEmptyStatement(effect);
    methods.forEach((method) => {
      if (method.conditions === null) {
        statement.Resource.push(method.resourceArn);
      } else {
        let conditionalStatement = this.getEmptyStatement(effect);
        conditionalStatement.Resource.push(method.resourceArn);
        conditionalStatement.Condition = method.conditions;
        statements.push(conditionalStatement);
      }
    });

    if (statement.Resource !== null && statement.Resource.length > 0) {
      statements.push(statement);
    }

    return statements;
  }

  /**
   * Adds an allow "*" statement to the policy.
   *
   * @method allowAllMethods
   */
  public allowAllMethods() {
    this.addMethod(PolicyEffect.Allow, HttpVerb.All, '*', null);
  }

  /**
   * Adds a deny "*" statement to the policy.
   *
   * @method denyAllMethods
   */
  public denyAllMethods() {
    this.addMethod(PolicyEffect.Deny, HttpVerb.All, '*', null);
  }

  /**
   * Adds an API Gateway method (Http verb + Resource path) to the list of allowed
   * methods for the policy
   *
   * @method allowMethod
   * @param verb The HTTP verb for the method, this should ideally come from the
   *                 AuthPolicy.HttpVerb object to avoid spelling mistakes
   * @param resource The resource path. For example "/pets"
   */
  public allowMethod(verb: HttpVerb, resource: string) {
    this.addMethod(PolicyEffect.Allow, verb, resource, null);
  }

  /**
   * Adds an API Gateway method (Http verb + Resource path) to the list of denied
   * methods for the policy
   *
   * @method denyMethod
   * @param verb The HTTP verb for the method, this should ideally come from the
   *                 AuthPolicy.HttpVerb object to avoid spelling mistakes
   * @param resource The resource path. For example "/pets"
   */
  public denyMethod(verb: HttpVerb, resource: string) {
    this.addMethod(PolicyEffect.Deny, verb, resource, null);
  }

  /**
   * Adds an API Gateway method (Http verb + Resource path) to the list of allowed
   * methods and includes a condition for the policy statement. More on AWS policy
   * conditions here: http://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements.html#Condition
   *
   * @method allowMethodWithConditions
   * @param verb The HTTP verb for the method, this should ideally come from the
   *                 AuthPolicy.HttpVerb object to avoid spelling mistakes
   * @param resource The resource path. For example "/pets"
   * @param conditions The conditions object in the format specified by the AWS docs
   */
  public allowMethodWithConditions(verb: HttpVerb, resource: string, conditions: Condition) {
    this.addMethod(PolicyEffect.Allow, verb, resource, conditions);
  }

  /**
   * Adds an API Gateway method (Http verb + Resource path) to the list of denied
   * methods and includes a condition for the policy statement. More on AWS policy
   * conditions here: http://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements.html#Condition
   *
   * @method denyMethodWithConditions
   * @param verb The HTTP verb for the method, this should ideally come from the
   *                 AuthPolicy.HttpVerb object to avoid spelling mistakes
   * @param resource The resource path. For example "/pets"
   * @param conditions The conditions object in the format specified by the AWS docs
   */
  public denyMethodWithConditions(verb: HttpVerb, resource: string, conditions: Condition) {
    this.addMethod(PolicyEffect.Deny, verb, resource, conditions);
  }

  /**
   * Generates the policy document based on the internal lists of allowed and denied
   * conditions. This will generate a policy with two main statements for the effect:
   * one statement for Allow and one statement for Deny.
   * Methods that includes conditions will have their own statement in the policy.
   *
   * @method build
   * @return The policy object that can be serialized to JSON.
   */
  public build(): Policy {
    if (this.allowMethods.length === 0 && this.denyMethods.length === 0) {
      throw new Error('No statements defined for the policy');
    }

    const document: PolicyDocument = {
      Version: AuthorityPolicyBuilder.VERSION,
      Statement: [],
    };

    document.Statement = document.Statement.concat(
      this.getStatementsForEffect(PolicyEffect.Allow, this.allowMethods),
    );

    document.Statement = document.Statement.concat(
      this.getStatementsForEffect(PolicyEffect.Deny, this.denyMethods),
    );

    return {
      principalId: this.principalId,
      policyDocument: document,
    };
  }
}
