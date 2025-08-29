import { getByIdProductsDependencies } from '../../src/case/useCaseGetByIdProducts/getByIdOrdersDepencies';
import { useCaseGetByIdProducts } from '../../src/case/useCaseGetByIdProducts/useCaseGetByIdProducts';

describe('useCaseGetByIdProducts', () => {
  let dependencies: getByIdProductsDependencies;
  const productId = 'prod-123';

  beforeEach(() => {
    const repository = {
      getProductById: jest.fn(),
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

  it('debe llamar al repositorio con el id, loguear y devolver la respuesta', async () => {
    const repoResponse = {
      productId: 'prod-123',
      name: 'Teclado',
      price: 120.5,
      stock: 10,
      createdAt: '2025-01-01T00:00:00.000Z',
      status: 'ACTIVE',
    };

    (dependencies.repository.getProductById as jest.Mock).mockResolvedValue(repoResponse);

    const uc = useCaseGetByIdProducts();
    const result = await uc(dependencies, productId);

    expect(dependencies.repository.getProductById).toHaveBeenCalledTimes(1);
    expect(dependencies.repository.getProductById).toHaveBeenCalledWith(productId);

    expect(dependencies.logger.info).toHaveBeenCalledWith('✅ Get product', repoResponse);
    expect(result).toBe(repoResponse);
  });

  it('propaga el error si el repositorio rechaza y no loguea éxito', async () => {
    const err = new Error('repo fail');
    (dependencies.repository.getProductById as jest.Mock).mockRejectedValue(err);

    const uc = useCaseGetByIdProducts();

    await expect(uc(dependencies, productId)).rejects.toThrow(err);
    expect(dependencies.repository.getProductById).toHaveBeenCalledWith(productId);
    expect(dependencies.logger.info).not.toHaveBeenCalled();
  });
});
