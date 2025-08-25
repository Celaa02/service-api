// test/usecases/useCaseCreateOrders.test.ts
import { createOrdersDependencies } from '../../../src/domain/case/dependencies/CreateOrdersDepencies';
import { useCaseCreateOrders } from '../../../src/domain/case/useCaseCreateOrders';
import { createOrders } from '../../../src/domain/models/OrdersModelsHttp';
import { _201_CREATED_ } from '../../../src/utils/HttpResponse';
import { AppError } from '../../../src/utils/HttpResponseErrors';

jest.mock('../../../src/utils/HttpResponse', () => ({
  _201_CREATED_: jest.fn(),
}));

jest.mock('../../../src/utils/HttpResponseErrors', () => ({
  AppError: {
    invalidInput: jest.fn(),
  },
}));

describe('useCaseCreateOrders', () => {
  const dependencies = {} as unknown as createOrdersDependencies;
  const input: createOrders = {
    orderId: 'abc-123',
    amount: 99.99,
    customerId: 'cust-1',
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería retornar la respuesta de _201_CREATED_ cuando no hay errores', async () => {
    const mockResponse = {
      statusCode: 201,
      body: JSON.stringify({ ok: true }),
      headers: { 'content-type': 'application/json' },
    };

    (_201_CREATED_ as jest.Mock).mockReturnValue(mockResponse);

    const uc = useCaseCreateOrders();
    const result = await uc(dependencies, input);

    expect(_201_CREATED_).toHaveBeenCalledWith(input);
    expect(result).toEqual(mockResponse);
    expect(AppError.invalidInput).not.toHaveBeenCalled();
  });

  it('debería capturar errores y retornar AppError.invalidInput(message)', async () => {
    const thrown = new Error('payload inválido');
    (_201_CREATED_ as jest.Mock).mockImplementation(() => {
      throw thrown;
    });

    const mappedError = {
      statusCode: 400,
      body: JSON.stringify({ message: 'invalid input' }),
    };
    (AppError.invalidInput as jest.Mock).mockReturnValue(mappedError);

    const uc = useCaseCreateOrders();
    const result = await uc(dependencies, input);

    expect(_201_CREATED_).toHaveBeenCalledWith(input);
    expect(AppError.invalidInput).toHaveBeenCalledWith('payload inválido');
    expect(result).toEqual(mappedError);
  });
});
