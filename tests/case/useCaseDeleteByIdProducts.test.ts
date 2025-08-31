import { deleteByIdProductsDependencies } from '../../src/case/useCaseDeleteByIdProducts/deleteByIdOrdersDepencies';
import { useCaseDeleteByIdProducts } from '../../src/case/useCaseDeleteByIdProducts/useCaseDeleteByIdProducts';

describe('useCaseDeleteByIdProducts', () => {
  let dependencies: deleteByIdProductsDependencies;

  beforeEach(() => {
    dependencies = {
      repository: {
        deleteProduct: jest.fn(),
      },
      logger: {
        info: jest.fn(),
      },
    } as unknown as deleteByIdProductsDependencies;

    jest.clearAllMocks();
  });

  it('debe llamar al repositorio con el id, loguear y devolver la respuesta', async () => {
    const productId = 'prod-123';
    const deletedResponse = { productId, deleted: true };

    (dependencies.repository.deleteProduct as jest.Mock).mockResolvedValue(deletedResponse);

    const uc = useCaseDeleteByIdProducts();
    const res = await uc(dependencies, productId);

    expect(dependencies.repository.deleteProduct).toHaveBeenCalledTimes(1);
    expect(dependencies.repository.deleteProduct).toHaveBeenCalledWith(productId);

    expect(dependencies.logger.info).toHaveBeenCalledWith('✅ Delete product', deletedResponse);
    expect(res).toBe(deletedResponse);
  });

  it('propaga el error si el repositorio rechaza y no loguea éxito', async () => {
    const productId = 'prod-err';
    const err = new Error('db error');
    (dependencies.repository.deleteProduct as jest.Mock).mockRejectedValue(err);

    const uc = useCaseDeleteByIdProducts();

    await expect(uc(dependencies, productId)).rejects.toThrow(err);
    expect(dependencies.repository.deleteProduct).toHaveBeenCalledWith(productId);
    expect(dependencies.logger.info).not.toHaveBeenCalled();
  });
});
