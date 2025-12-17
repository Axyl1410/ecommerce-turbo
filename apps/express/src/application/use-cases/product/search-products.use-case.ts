import type {
  ProductSearchItemDTO,
  ProductSearchListDTO,
} from "@workspace/types";
import type { GetProductsDTO } from "@workspace/types";
import type { IProductRepository } from "../../../domain/repositories/product.repository.js";

export class SearchProductsUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(params: GetProductsDTO): Promise<ProductSearchListDTO> {
    const {
      page = 1,
      limit = 10,
      status = "PUBLISHED", // Default to only show published products
      categoryId,
      brandId,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    // Get products with variants included
    const result = await this.productRepository.findManyWithVariants({
      page,
      limit,
      status,
      categoryId,
      brandId,
      search,
      sortBy,
      sortOrder,
    });

    // Map products to include price from first variant
    const productsWithPrice: ProductSearchItemDTO[] = result.products.map(
      (product: (typeof result.products)[number]) => {
        const firstVariant = product.variants?.[0];

        return {
          id: product.id,
          name: product.name,
          slug: product.getSlug(),
          description: product.description,
          brandId: product.brandId,
          categoryId: product.categoryId,
          defaultImage: product.defaultImage,
          seoMetaTitle: product.seoMetaTitle,
          seoMetaDesc: product.seoMetaDesc,
          status: product.getStatus(),
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
          price: firstVariant?.price ?? 0,
          salePrice: firstVariant?.salePrice ?? null,
          variantCount: product.variants?.length ?? 0,
        };
      }
    );

    return {
      products: productsWithPrice,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    };
  }
}
