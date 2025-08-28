import { listProductsDependencies } from '../../src/case/useCaseListProducts/listProductsDepencies';
import { useCaseListProducts } from '../../src/case/useCaseListProducts/useCaseListProducts';

describe('useCaseListProducts', () => {
  let dependencies: listProductsDependencies;

  beforeEach(() => {
    dependencies = {
      repository: {
        listAll: jest.fn(),
      } as any,
      logger: {
        info: jest.fn(),
      } as any,
    };
    jest.clearAllMocks();
  });

  it('debe llamar al repositorio, loguear y devolver la respuesta', async () => {
    const repoResponse = {
      items: [
        {
          productId: 'p1',
          name: 'Mouse',
          price: 35,
          status: 'ACTIVE',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
        {
          productId: 'p2',
          name: 'Teclado',
          price: 120,
          status: 'ACTIVE',
          createdAt: '2025-01-02T00:00:00.000Z',
        },
      ],
      nextCursor: undefined,
    };
    (dependencies.repository.listAll as jest.Mock).mockResolvedValue(repoResponse);

    const uc = useCaseListProducts();
    const result = await uc(dependencies);

    expect(dependencies.repository.listAll).toHaveBeenCalledTimes(1);
    expect(dependencies.logger.info).toHaveBeenCalledWith('✅ list products', repoResponse);
    expect(result).toBe(repoResponse);
  });

  it('propaga el error si el repositorio falla y no loguea éxito', async () => {
    const err = new Error('db fail');
    (dependencies.repository.listAll as jest.Mock).mockRejectedValue(err);

    const uc = useCaseListProducts();

    await expect(uc(dependencies)).rejects.toThrow(err);
    expect(dependencies.repository.listAll).toHaveBeenCalledTimes(1);
    expect(dependencies.logger.info).not.toHaveBeenCalled();
  });
});
