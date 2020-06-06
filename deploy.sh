#!/bin/bash

PROJECT_NAME=$1

aws s3api create-bucket --bucket $PROJECT_NAME
if [ $? != 0 ]; then
  echo Failed to create a bucket named $PROJECT_NAME
  echo The bucket may be owned by a user.
  echo Please change the project name to create a different bucket and avoid conflict.
  exit 1
fi

aws s3 cp db-init.sql "s3://${PROJECT_NAME}/db-init.sql"
if [ $? != 0 ]; then
  echo Failed to upload the file db-init.sql
  echo Please upload it manually with AWS CLI
  exit 1
fi

NODE_ENV=production npm run build

./package-layer.sh

sam package --template-file template.yaml --s3-bucket $PROJECT_NAME --output-template-file template.packaged.yaml

echo "Note: The value of the parameter ProjectName must be the same as you entered earlier."

sam deploy --guided --template-file template.packaged.yaml --stack-name $PROJECT_NAME --s3-prefix packaged --capabilities CAPABILITY_IAM --parameter-overrides Stage=prod ProjectName=$PROJECT_NAME --no-fail-on-empty-changeset
