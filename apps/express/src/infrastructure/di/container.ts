/**
 * Dependency Injection Container
 * Manual DI container for managing dependencies
 */

import type { ICacheService } from "@/application/interfaces/cache.interface";
import { AddItemToCartUseCase } from "@/application/use-cases/cart/add-item-to-cart.use-case";
import { ClearCartUseCase } from "@/application/use-cases/cart/clear-cart.use-case";
import { ClearCartAfterOrderUseCase } from "@/application/use-cases/cart/clear-cart-after-order.use-case";
import { GetCartDetailsUseCase } from "@/application/use-cases/cart/get-cart-details.use-case";
import { GetOrCreateCartUseCase } from "@/application/use-cases/cart/get-or-create-cart.use-case";
import { RemoveCartItemUseCase } from "@/application/use-cases/cart/remove-cart-item.use-case";
import { UpdateCartItemUseCase } from "@/application/use-cases/cart/update-cart-item.use-case";
import { GetBrandsUseCase } from "@/application/use-cases/brand/get-brands.use-case";
import { CreateCategoryUseCase } from "@/application/use-cases/category/create-category.use-case";
import { DeleteCategoryUseCase } from "@/application/use-cases/category/delete-category.use-case";
import { GetCategoriesUseCase } from "@/application/use-cases/category/get-categories.use-case";
import { GetCategoryByIdUseCase } from "@/application/use-cases/category/get-category-by-id.use-case";
import { GetCategoryBySlugUseCase } from "@/application/use-cases/category/get-category-by-slug.use-case";
import { UpdateCategoryUseCase } from "@/application/use-cases/category/update-category.use-case";
import { CreateProductUseCase } from "@/application/use-cases/product/create-product.use-case";
import { DeleteProductUseCase } from "@/application/use-cases/product/delete-product.use-case";
import { GetProductByIdUseCase } from "@/application/use-cases/product/get-product-by-id.use-case";
import { GetProductBySlugUseCase } from "@/application/use-cases/product/get-product-by-slug.use-case";
import { GetProductsUseCase } from "@/application/use-cases/product/get-products.use-case";
import { SearchProductsUseCase } from "@/application/use-cases/product/search-products.use-case";
import { UpdateProductUseCase } from "@/application/use-cases/product/update-product.use-case";
import { AddToWishlistUseCase } from "@/application/use-cases/wishlist/add-wishlist.use-case";
import { RemoveFromWishlistUseCase } from "@/application/use-cases/wishlist/remove-wishlist.use-case";
import { GetUserWishlistUseCase } from "@/application/use-cases/wishlist/get-wishlist.use-case";
import type { IBrandRepository } from "@/domain/repositories/brand.repository";
import type { ICartRepository } from "@/domain/repositories/cart.repository";
import type { ICategoryRepository } from "@/domain/repositories/category.repository";
import type { IProductRepository } from "@/domain/repositories/product.repository";
import type { IWishlistRepository } from "@/domain/repositories/wishlistitem.repository";
import { RedisCacheService } from "@/infrastructure/cache/redis-cache.service";
import { PrismaBrandRepository } from "@/infrastructure/persistence/prisma/brand.repository.impl";
import { PrismaCartRepository } from "@/infrastructure/persistence/prisma/cart.repository.impl";
import { PrismaCategoryRepository } from "@/infrastructure/persistence/prisma/category.repository.impl";
import { PrismaProductRepository } from "@/infrastructure/persistence/prisma/product.repository.impl";
import { BrandController } from "@/presentation/controllers/brand.controller";
import { PrismaWishlistRepository } from "@/infrastructure/persistence/prisma/wishlistitem.repository";
import { CartController } from "@/presentation/controllers/cart.controller";
import { CategoryController } from "@/presentation/controllers/category.controller";
import { ProductController } from "@/presentation/controllers/product.controller";
import { WishlistController } from "@/presentation/controllers/wishlist.controller";

export class DIContainer {
	private services: Map<string, unknown> = new Map();

	/**
	 * Register a service in the container
	 */
	register<T>(key: string, service: T): void {
		this.services.set(key, service);
	}

	/**
	 * Get a service from the container
	 */
	get<T>(key: string): T {
		const service = this.services.get(key);
		if (!service) {
			throw new Error(`Service '${key}' not found in container`);
		}
		return service as T;
	}

	/**
	 * Check if a service is registered
	 */
	has(key: string): boolean {
		return this.services.has(key);
	}

	/**
	 * Initialize all dependencies
	 */
	initialize(): void {
		// Infrastructure layer
		const productRepository: IProductRepository = new PrismaProductRepository();
		const brandRepository: IBrandRepository = new PrismaBrandRepository();
		const categoryRepository: ICategoryRepository =
			new PrismaCategoryRepository();
		const cartRepository: ICartRepository = new PrismaCartRepository();
		const cacheService: ICacheService = new RedisCacheService();

		// Register infrastructure
		this.register("productRepository", productRepository);
		this.register("brandRepository", brandRepository);
		this.register("categoryRepository", categoryRepository);
		this.register("cacheService", cacheService);
		this.register("cartRepository", cartRepository);

		// Application layer - Use cases
		const getProductsUseCase = new GetProductsUseCase(
			productRepository,
			cacheService,
		);
		const searchProductsUseCase = new SearchProductsUseCase(
			productRepository,
		);
		const getProductByIdUseCase = new GetProductByIdUseCase(
			productRepository,
			cacheService,
		);
		const getProductBySlugUseCase = new GetProductBySlugUseCase(
			productRepository,
			cacheService,
		);
		const createProductUseCase = new CreateProductUseCase(
			productRepository,
			cacheService,
			getProductByIdUseCase,
		);
		const updateProductUseCase = new UpdateProductUseCase(
			productRepository,
			cacheService,
			getProductByIdUseCase,
		);
		const deleteProductUseCase = new DeleteProductUseCase(
			productRepository,
			cacheService,
		);

		const getOrCreateCartUseCase = new GetOrCreateCartUseCase(
			cartRepository,
			cacheService,
		);
		const getCartDetailsUseCase = new GetCartDetailsUseCase(
			cartRepository,
			cacheService,
		);
		const addItemToCartUseCase = new AddItemToCartUseCase(
			cartRepository,
			cacheService,
		);
		const updateCartItemUseCase = new UpdateCartItemUseCase(
			cartRepository,
			cacheService,
		);
		const removeCartItemUseCase = new RemoveCartItemUseCase(
			cartRepository,
			cacheService,
		);
		const clearCartUseCase = new ClearCartUseCase(cartRepository, cacheService);
		const clearCartAfterOrderUseCase = new ClearCartAfterOrderUseCase(
			cartRepository,
			cacheService,
		);

		const getBrandsUseCase = new GetBrandsUseCase(
			brandRepository,
			cacheService,
		);

		const getCategoriesUseCase = new GetCategoriesUseCase(
			categoryRepository,
			cacheService,
		);
		const getCategoryByIdUseCase = new GetCategoryByIdUseCase(
			categoryRepository,
			cacheService,
		);
		const getCategoryBySlugUseCase = new GetCategoryBySlugUseCase(
			categoryRepository,
			cacheService,
		);
		const createCategoryUseCase = new CreateCategoryUseCase(
			categoryRepository,
			cacheService,
			getCategoryByIdUseCase,
		);
		const updateCategoryUseCase = new UpdateCategoryUseCase(
			categoryRepository,
			cacheService,
			getCategoryByIdUseCase,
		);
		const deleteCategoryUseCase = new DeleteCategoryUseCase(
			categoryRepository,
			cacheService,
		);

		// Repositories
		const wishlistRepository = new PrismaWishlistRepository();

		// Use Cases
		const addToWishlistUseCase = new AddToWishlistUseCase(
			wishlistRepository,
			productRepository,
		);
		const removeFromWishlistUseCase = new RemoveFromWishlistUseCase(
			wishlistRepository,
		);
		const getUserWishlistUseCase = new GetUserWishlistUseCase(wishlistRepository);

		// Register use cases
		this.register("getProductsUseCase", getProductsUseCase);
		this.register("searchProductsUseCase", searchProductsUseCase);
		this.register("getProductByIdUseCase", getProductByIdUseCase);
		this.register("getProductBySlugUseCase", getProductBySlugUseCase);
		this.register("createProductUseCase", createProductUseCase);
		this.register("updateProductUseCase", updateProductUseCase);
		this.register("deleteProductUseCase", deleteProductUseCase);
		this.register("getOrCreateCartUseCase", getOrCreateCartUseCase);
		this.register("getCartDetailsUseCase", getCartDetailsUseCase);
		this.register("addItemToCartUseCase", addItemToCartUseCase);
		this.register("updateCartItemUseCase", updateCartItemUseCase);
		this.register("removeCartItemUseCase", removeCartItemUseCase);
		this.register("clearCartUseCase", clearCartUseCase);
		this.register("clearCartAfterOrderUseCase", clearCartAfterOrderUseCase);
		this.register("getBrandsUseCase", getBrandsUseCase);
		this.register("getCategoriesUseCase", getCategoriesUseCase);
		this.register("getCategoryByIdUseCase", getCategoryByIdUseCase);
		this.register("getCategoryBySlugUseCase", getCategoryBySlugUseCase);
		this.register("createCategoryUseCase", createCategoryUseCase);
		this.register("updateCategoryUseCase", updateCategoryUseCase);
		this.register("deleteCategoryUseCase", deleteCategoryUseCase);
		this.register("addToWishlistUseCase", addToWishlistUseCase);
		this.register("removeFromWishlistUseCase", removeFromWishlistUseCase);
		this.register("getUserWishlistUseCase", getUserWishlistUseCase);

		// Presentation layer - Controllers
		const productController = new ProductController(
			getProductsUseCase,
			searchProductsUseCase,
			getProductByIdUseCase,
			getProductBySlugUseCase,
			createProductUseCase,
			updateProductUseCase,
			deleteProductUseCase,
		);
		const cartController = new CartController(
			getOrCreateCartUseCase,
			getCartDetailsUseCase,
			addItemToCartUseCase,
			updateCartItemUseCase,
			removeCartItemUseCase,
			clearCartUseCase,
		);
		const brandController = new BrandController(getBrandsUseCase);
		const categoryController = new CategoryController(
			getCategoriesUseCase,
			getCategoryByIdUseCase,
			getCategoryBySlugUseCase,
			createCategoryUseCase,
			updateCategoryUseCase,
			deleteCategoryUseCase,
		);
		const wishlistController = new WishlistController(
			addToWishlistUseCase,
			removeFromWishlistUseCase,
			getUserWishlistUseCase,
		);

		// Register controllers
		this.register("productController", productController);
		this.register("brandController", brandController);
		this.register("cartController", cartController);
		this.register("categoryController", categoryController);
		this.register("wishlistController", wishlistController);
	}
}

// Create singleton instance and initialize
export const container = new DIContainer();
container.initialize();
