import { listProductsDependencies } from '../../src/case/useCaseListProducts/listProductsDepencies';
import { useCaseListProducts } from '../../src/case/useCaseListProducts/useCaseListProducts';
import { listProduct } from '../../src/domain/models/ProductsMondels';

describe('useCaseListProducts', () => {
  let dependencies: listProductsDependencies;

  const input: listProduct = {
    limit: 10,
    cursor: undefined,
  } as any;

  beforeEach(() => {
    const repository = {
      listProducts: jest.fn(),
    };
    const logger = {
      info: jest.fn(),
    };

    dependencies = {
      repository: repository as any,
      logger: logger as any,
    };

    jest.clearAllMocks();
  });

  it('debe llamar al repositorio con el input, loguear y devolver la respuesta', async () => {
    const repoResponse = {
      items: [
        {
          productId: 'p-1',
          name: 'Teclado',
          price: 120.5,
          stock: 10,
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ],
      nextCursor: undefined,
    };
    (dependencies.repository.listProducts as jest.Mock).mockResolvedValue(repoResponse);

    const uc = useCaseListProducts();
    const result = await uc(dependencies, input);

    expect(dependencies.repository.listProducts).toHaveBeenCalledTimes(1);
    expect(dependencies.repository.listProducts).toHaveBeenCalledWith(input);

    expect(dependencies.logger.info).toHaveBeenCalledWith('✅ list products', repoResponse);
    expect(result).toBe(repoResponse);
  });

  it('propaga el error si el repositorio rechaza y no loguea éxito', async () => {
    const err = new Error('repo fail');
    (dependencies.repository.listProducts as jest.Mock).mockRejectedValue(err);

    const uc = useCaseListProducts();

    await expect(uc(dependencies, input)).rejects.toThrow(err);
    expect(dependencies.repository.listProducts).toHaveBeenCalledWith(input);
    expect(dependencies.logger.info).not.toHaveBeenCalled();
  });
});
