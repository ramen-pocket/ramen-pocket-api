# ramen-pocket-api

An API server based on AWS serverless application model for project Ramen Pocket.

## Requirements

### An AWS Account
Resources, such as Lambda and API Gateway, that are used in this project are specific to AWS, and therefore an AWS account is required.

### A Pair of AWS Access Key and Secret Access Key
An access key and a secret access key are used by AWS CLI to manage AWS services and by AWS SAM CLI to manage serverless applications.

If you don't have an access key or a secret access key or don't know how to configure the keys, please check out [this official guide](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html).

Please be sure that the keys you are going to use have granted enough permissions to build this application.

### AWS CLI
The AWS Command Line Interface (CLI) is a unified tool to manage your AWS services.

In this project, AWS CLI is used to create an S3 bucket in which packaged source code files and the template file are placed.

If you don't have AWS CLI, please check out [this official guide](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) to download and install it.

### AWS SAM CLI
The AWS Serverless Application Model (AWS SAM) is an open-source framework that you can use to build serverless applications on AWS.

We use its command line interface (AWS SAM CLI) to package our source code, deploy the application, and manage it.

If you don't have AWS SAM CLI, please check out [this official guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) to download and install it.

For more information about AWS SAM, please refer to [the official documentation](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html).

### Domain Name
A domain name is required since the project uses Google Sign-In, which manages [the OAuth 2.0 flow](https://en.wikipedia.org/wiki/OAuth) and token lifecycle.

You can get a domain name from a domain name registration like [GoDaddy](https://www.godaddy.com/offers/domains) or [Gandi](https://www.gandi.net/en).

### Google Sign-In and OAuth 2.0 Client
This application relies on the trusted third-party service Google Sign-In to let users sign in and use our service.

Our service also needs tokens created by Google Sign-In to recognize users' identities.

Please go to [the credential page](https://console.developers.google.com/apis/credentials) to create a OAuth 2.0 Client ID for this application.

Both the frontend (iOS application) and the backend service require the credential.

### A Cloudflare Credential
We use Cloudflare as the CDN and the name server for the domain, and configure it to map the domain name to the endpoint of the API Gateway.

However, simply pointing Cloudflare at the API Gateway domain will not work out because:
- The API Gateway uses shared hosting and therefore it uses the domain name to resolve what API to send requests to. That is, it does not know that the custom domain belongs to the API.
- The API Gateway require using `https`, but its certificate is only valid for the default domain.

To solve this problem, we have to create a SSL certificate for the custom domain, copy it to AWS Certificate Manager, and configure the API Gateway to use it.

## Resources

The list below presents all AWS resources this project uses:
- **An IAM Role**
  - An IAM role used by Lambdas so that they have permission to access AWS resources.
- **An EC2 Instance**
  - An EC2 instance whose type is `t2.micro` will be used to initialize all tables in the database. Once it finish the initialization, it will terminate itself.
- **A VPC Security Group**
  - A VPC security group will be created and used by a RDS instance and thus Lambdas will be able to access the database.
- **S3 Buckets**
  - An S3 bucket is used by AWS SAM CLI to store the packaged source code and template file.
  - AWS SAM CLI itself also used an S3 bucket to serverless projects.
- **A RDS instance**
  - The data of this application is stored in a relational database that has 20-GB storage and `db.t2.micro` instance type and uses *MariaDB* as its engine.
- **Lambdas**
  - All lambdas are used to handle the requests. Except for the authorizer lambda, each lambda is mapped to a method on the API Gateway.
- **An API Gateway**
  - The main job this API Gateway does is to resolve every request, pass it to a corresponding lambda, and send the response back to the client.
- **Certificate Manager**
  - A certificate record will be created to store the SSL certificate of the custom domain, and the record will be used by the API Gateway.

## Commands

Transpile TypeScript files in `src` into JavaScript in `dist`:

```bash
npm run build
```

Package the template file `template.yaml` with AWS SAM tool, upload to a S3 bucket, and export the transformed CloudFormation template file `template.packaged.yaml`:

```bash
npm run package
```

Deploy this application to AWS:

```bash
npm run deploy
```

Update the modified resources to AWS:

```bash
npm run update
```

Clean the files in `dist`:

```bash
npm run clean
```
