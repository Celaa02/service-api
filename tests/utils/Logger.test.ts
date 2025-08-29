jest.mock('winston', () => {
  const combine = jest.fn((...args: any[]) => ({ type: 'combine', args }));
  const timestamp = jest.fn(() => 'timestamp()');
  const errors = jest.fn(() => 'errors()');
  const colorize = jest.fn(() => 'colorize()');
  const uncolorize = jest.fn(() => 'uncolorize()');
  const printf = jest.fn((fn: any) => ({ type: 'printf', fn }));
  const json = jest.fn(() => 'json()');

  const createLogger = jest.fn((opts: any) => ({ __logger: true, opts }));
  const Console = jest.fn((opts: any) => ({ __console: true, opts }));

  return {
    createLogger,
    format: { combine, timestamp, errors, colorize, uncolorize, printf, json },
    transports: { Console },
  };
});

const ORIGINAL_ENV = process.env;

describe('logger (winston) con import', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
    delete process.env.IS_OFFLINE;
    delete process.env.STAGE;
    delete process.env.LOG_LEVEL;
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('usa level "debug" y colorize/printf cuando IS_OFFLINE=true', async () => {
    process.env.IS_OFFLINE = 'true';

    const winston = await import('winston');
    const { logger } = await import('../../src/utils/Logger');

    expect(winston.createLogger).toHaveBeenCalledTimes(1);
    const call = (winston.createLogger as jest.Mock).mock.calls[0][0];

    expect(call.level).toBe('debug');

    expect(winston.format.combine).toHaveBeenCalledTimes(1);
    const combineArgs = (winston.format.combine as jest.Mock).mock.calls[0];
    expect(combineArgs).toEqual([
      'timestamp()',
      'errors()',
      'colorize()',
      expect.objectContaining({ type: 'printf' }),
    ]);

    expect(winston.transports.Console).toHaveBeenCalledWith(
      expect.objectContaining({
        handleExceptions: true,
        handleRejections: true,
        stderrLevels: ['error'],
        consoleWarnLevels: ['warn'],
        silent: false,
      }),
    );

    expect(logger).toEqual(expect.objectContaining({ __logger: true }));
  });

  it('usa level "debug" y colorize/printf cuando STAGE=dev', async () => {
    process.env.STAGE = 'dev';

    const winston = await import('winston');
    await import('../../src/utils/Logger');

    expect(winston.createLogger).toHaveBeenCalledTimes(1);
    const call = (winston.createLogger as jest.Mock).mock.calls[0][0];
    expect(call.level).toBe('debug');

    const combineArgs = (winston.format.combine as jest.Mock).mock.calls[0];
    expect(combineArgs).toEqual([
      'timestamp()',
      'errors()',
      'colorize()',
      expect.objectContaining({ type: 'printf' }),
    ]);
  });

  it('usa level "info" y uncolorize/json en entorno NO local', async () => {
    const winston = await import('winston');
    await import('../../src/utils/Logger');

    expect(winston.createLogger).toHaveBeenCalledTimes(1);
    const call = (winston.createLogger as jest.Mock).mock.calls[0][0];
    expect(call.level).toBe('info');

    const combineArgs = (winston.format.combine as jest.Mock).mock.calls[0];
    expect(combineArgs).toEqual(['timestamp()', 'errors()', 'uncolorize()', 'json()']);
  });

  it('LOG_LEVEL tiene prioridad y se convierte a minúsculas', async () => {
    process.env.LOG_LEVEL = 'WARN';

    const winston = await import('winston');
    await import('../../src/utils/Logger');

    const call = (winston.createLogger as jest.Mock).mock.calls[0][0];
    expect(call.level).toBe('warn');
  });
});
