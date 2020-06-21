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
- **Two IAM Roles**
  - An IAM role used by Lambdas so that they have permission to access AWS resources.
  - The other IAM role is used by the EC2 instance, making it able to initialize the database.
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

## Deployment

The following steps guide you to deploy this serverless API service on your AWS account.

### Creating a record in AWS Certificate Manager
Since this application uses Google Sign-In to identify and authorize users, a domain name is required.

To make the API Gateway able to use the domain name and recognize the SSL connection, a certificate is required from a content-delivery-network service provider such as [*Amazon Cloudfront*](https://aws.amazon.com/cloudfront/) or [*Cloudflare*](https://www.cloudflare.com/).

In this guide, we will use *Cloudflare* to accomplish this requirement.

Please go to your Cloudflare dashboard, choose a domain to use, and refer to **step 6 to step 19** of [*this tutorial*](https://virtualprism.me/articles/post/2020/4/21/A%20note%20for%20using%20AWS%20API%20Gateway%20with%20Cloudflare) to create a new credential.

Once you finish it, copy the ARN of the credential on the AWS Credential Manager page to the clipboard.

We will use it in the next step.

### Running Script
Go to the root directory of this project and run the command `./deploy.sh PROJECT_NAME`, in which `PROJECT_NAME` is replaced by the name you want.

The script in `deploy.sh` will create a bucket named `PROJECT_NAME` and upload `db-init.sql` to it.

If it failed to create the bucket, change `PROJECT_NAME` and re-run the command since the bucket name has already taken by another user.

Next, it will build the project, package the template, and commence the deployment.

Notice that the parameter `ProjectName` must be the same as `PROJECT_NAME` and the value of `CertificateARN` is the ARN of the credential you just created.

It will initiate the deployment after confirming the resource creation.

The application will be ready after 5 to 10 minutes of the deployment process.

### Updating Domain Record
The finally step is to add a CNAME record to Cloudflare, making it point to the API Gateway.

Go to the AWS API Gateway dashboard and choose `ramen-pocket-api`.

Next, click **Stage** on the list on the left, choose **Prod**, and copy the domain name of the **Invoke URL**

Lasty, create a CNAME record in which its content is the domain name you copied.

Notice that it must matches the value of the parameter `ApiDomain` you entered during the deployment.

*If you are still unsure how to do it, **step 2 to step 5** of [*this tutorial*](https://virtualprism.me/articles/post/2020/4/21/A%20note%20for%20using%20AWS%20API%20Gateway%20with%20Cloudflare) would be your help.*

After it created, you should be able to access the API servcie.

## Tearing Down
*Be sure to back up all the data in the database before tearing down this application!*

Two steps to tearing down this application:
- On the Cloudformation dashboard, delete the stack with the project name you entered.
- On the S3 dashboard, delete the bucket with the project name you entered.

## Architecture
![](https://i.imgur.com/zeDUOEg.png)

## Commands

Transpile TypeScript files in `src` into JavaScript in `dist`:

```bash
npm run build
```

Package the template file `template.yaml` with AWS SAM tool, upload to a S3 bucket, and export the transformed CloudFormation template file `template.packaged.yaml`:

```bash
npm run package
```

Deploy this application to AWS *for development*:

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

Deploy this application to AWS *for production*:
```bash
./deploy.sh PROJECT_NAME
```
