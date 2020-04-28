# ramen-pocket-api

An API server based on AWS serverless application model for project Ramen Pocket.

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
