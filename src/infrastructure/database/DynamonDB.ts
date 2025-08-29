import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const region = process.env.AWS_REGION || 'us-east-1';
const forceLocal = process.env.FORCE_LOCAL === 'true' || process.env.IS_OFFLINE === 'true';

const localEndpoint = process.env.DYNAMO_ENDPOINT || 'http://127.0.0.1:8000';

const baseConfig: any = { region };

if (forceLocal) {
  baseConfig.endpoint = localEndpoint;
  baseConfig.credentials = {
    accessKeyId: 'local',
    secretAccessKey: 'local',
  };
}

const client = new DynamoDBClient(baseConfig);

export const ddbDoc = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});
