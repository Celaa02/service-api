import { createProductsDependencies } from '../../src/case/useCaseCreateProducts/CreateProductsDepencies';
import { useCaseCreateProducts } from '../../src/case/useCaseCreateProducts/useCaseCreateProducts';
import { productCreate } from '../../src/domain/models/ProductsMondels';

describe('useCaseCreateProducts', () => {
  let dependencies: createProductsDependencies;
  const input: productCreate = {
    productId: 'p-1',
    name: 'Teclado',
    price: 120.5,
    stock: 10,
    createdAt: '2025-01-01T00:00:00.000Z',
  } as any;

  beforeEach(() => {
    const repository = {
      createProduct: jest.fn(),
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
      productId: 'p-1',
      name: 'Teclado',
      price: 120.5,
      stock: 10,
      createdAt: '2025-01-01T00:00:00.000Z',
    };
    (dependencies.repository.createProduct as jest.Mock).mockResolvedValue(repoResponse);

    const uc = useCaseCreateProducts();
    const result = await uc(dependencies, input);

    expect(dependencies.repository.createProduct).toHaveBeenCalledTimes(1);
    expect(dependencies.repository.createProduct).toHaveBeenCalledWith(input);

    expect(dependencies.logger.info).toHaveBeenCalledWith('✅ order', repoResponse);
    expect(result).toBe(repoResponse);
  });

  it('propaga el error si el repositorio rechaza y no loguea éxito', async () => {
    const err = new Error('repo fail');
    (dependencies.repository.createProduct as jest.Mock).mockRejectedValue(err);

    const uc = useCaseCreateProducts();

    await expect(uc(dependencies, input)).rejects.toThrow(err);
    expect(dependencies.repository.createProduct).toHaveBeenCalledWith(input);
    expect(dependencies.logger.info).not.toHaveBeenCalled();
  });
});
