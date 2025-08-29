jest.mock('@aws-sdk/client-dynamodb', () => {
  return {
    DynamoDBClient: jest.fn().mockImplementation((cfg: any) => ({ __client: true, cfg })),
  };
});

jest.mock('@aws-sdk/lib-dynamodb', () => {
  return {
    DynamoDBDocumentClient: {
      from: jest.fn(() => ({ __doc: true })),
    },
  };
});

const ORIGINAL_ENV_DYNAMO = { ...process.env };

describe('DynamonDB bootstrap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV_DYNAMO };
    delete process.env.AWS_REGION;
    delete process.env.FORCE_LOCAL;
    delete process.env.IS_OFFLINE;
    delete process.env.DYNAMO_ENDPOINT;
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV_DYNAMO;
  });

  it('usa configuración por defecto (solo region) cuando no hay flags locales', async () => {
    const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
    const { DynamoDBDocumentClient } = await import('@aws-sdk/lib-dynamodb');

    await import('../../../src/infrastructure/database/DynamonDB');

    expect(DynamoDBClient as jest.Mock).toHaveBeenCalledTimes(1);
    const cfg = (DynamoDBClient as jest.Mock).mock.calls[0][0];
    expect(cfg).toEqual({ region: 'us-east-1' });

    expect(DynamoDBDocumentClient.from).toHaveBeenCalledTimes(1);
    const fromArgs = (DynamoDBDocumentClient.from as jest.Mock).mock.calls[0];
    expect(fromArgs[0]).toEqual(expect.objectContaining({ __client: true }));
    expect(fromArgs[1]).toEqual({
      marshallOptions: { removeUndefinedValues: true },
    });
  });

  it('activa modo local con FORCE_LOCAL=true (endpoint + credentials)', async () => {
    process.env.FORCE_LOCAL = 'true';
    process.env.DYNAMO_ENDPOINT = 'http://127.0.0.1:8000';
    process.env.AWS_REGION = 'us-west-2';

    const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
    const { DynamoDBDocumentClient } = await import('@aws-sdk/lib-dynamodb');

    await import('../../../src/infrastructure/database/DynamonDB');

    expect(DynamoDBClient as jest.Mock).toHaveBeenCalledTimes(1);
    const cfg = (DynamoDBClient as jest.Mock).mock.calls[0][0];
    expect(cfg).toEqual({
      region: 'us-west-2',
      endpoint: 'http://127.0.0.1:8000',
      credentials: { accessKeyId: 'local', secretAccessKey: 'local' },
    });

    expect(DynamoDBDocumentClient.from).toHaveBeenCalledWith(
      expect.objectContaining({ __client: true }),
      { marshallOptions: { removeUndefinedValues: true } },
    );
  });

  it('activa modo local con IS_OFFLINE=true (usa endpoint por defecto si no se setea)', async () => {
    process.env.IS_OFFLINE = 'true';
    process.env.AWS_REGION = 'us-east-1';

    const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');

    await import('../../../src/infrastructure/database/DynamonDB');

    const cfg = (DynamoDBClient as jest.Mock).mock.calls[0][0];
    expect(cfg).toEqual({
      region: 'us-east-1',
      endpoint: 'http://127.0.0.1:8000',
      credentials: { accessKeyId: 'local', secretAccessKey: 'local' },
    });
  });

  it('respeta un DYNAMO_ENDPOINT custom', async () => {
    process.env.FORCE_LOCAL = 'true';
    process.env.DYNAMO_ENDPOINT = 'http://localhost:4566';
    process.env.AWS_REGION = 'eu-central-1';

    const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');

    await import('../../../src/infrastructure/database/DynamonDB');

    const cfg = (DynamoDBClient as jest.Mock).mock.calls[0][0];
    expect(cfg).toEqual({
      region: 'eu-central-1',
      endpoint: 'http://localhost:4566',
      credentials: { accessKeyId: 'local', secretAccessKey: 'local' },
    });
  });

  it('si solo se ajusta AWS_REGION, no debe activar endpoint ni credentials', async () => {
    process.env.AWS_REGION = 'ap-south-1';

    const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');

    await import('../../../src/infrastructure/database/DynamonDB');

    const cfg = (DynamoDBClient as jest.Mock).mock.calls[0][0];
    expect(cfg).toEqual({ region: 'ap-south-1' });
  });
});
