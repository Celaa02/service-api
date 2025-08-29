import { updateByIdProductsDependencies } from '../../src/case/useCaseUpdateByIdProducts/updateByIdProductsDepencies';
import { useCaseUpdateByIdProducts } from '../../src/case/useCaseUpdateByIdProducts/useCaseUpdateByIdProduct';
import { UpdateProductInput } from '../../src/domain/models/ProductsMondels';

describe('useCaseUpdateByIdProducts', () => {
  let dependencies: updateByIdProductsDependencies;

  beforeEach(() => {
    dependencies = {
      repository: {
        updateProduct: jest.fn(),
      },
      logger: {
        info: jest.fn(),
      },
    } as unknown as updateByIdProductsDependencies;

    jest.clearAllMocks();
  });

  it('debe llamar al repositorio con el input, loguear y devolver la respuesta', async () => {
    const input: UpdateProductInput = {
      productId: 'prod-123',
      name: 'Nuevo nombre',
      price: 199.99,
      stock: 20,
      status: 'ACTIVE',
    } as any;

    const updated = {
      productId: 'prod-123',
      name: 'Nuevo nombre',
      price: 199.99,
      stock: 20,
      status: 'ACTIVE',
      createdAt: '2025-01-01T00:00:00.000Z',
    };

    (dependencies.repository.updateProduct as jest.Mock).mockResolvedValue(updated);

    const uc = useCaseUpdateByIdProducts();
    const res = await uc(dependencies, input);

    expect(dependencies.repository.updateProduct).toHaveBeenCalledTimes(1);
    expect(dependencies.repository.updateProduct).toHaveBeenCalledWith(input);

    expect(dependencies.logger.info).toHaveBeenCalledWith('✅ Update product id', updated);
    expect(res).toBe(updated);
  });

  it('propaga el error si el repositorio rechaza', async () => {
    const input: UpdateProductInput = {
      productId: 'prod-err',
      name: 'X',
    } as any;

    const err = new Error('db error');
    (dependencies.repository.updateProduct as jest.Mock).mockRejectedValue(err);

    const uc = useCaseUpdateByIdProducts();

    await expect(uc(dependencies, input)).rejects.toThrow(err);
    expect(dependencies.repository.updateProduct).toHaveBeenCalledWith(input);
    expect(dependencies.logger.info).not.toHaveBeenCalled();
  });
});
