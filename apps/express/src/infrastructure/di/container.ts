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
import { CreateProductUseCase } from "@/application/use-cases/product/create-product.use-case";
import { DeleteProductUseCase } from "@/application/use-cases/product/delete-product.use-case";
import { GetProductByIdUseCase } from "@/application/use-cases/product/get-product-by-id.use-case";
import { GetProductBySlugUseCase } from "@/application/use-cases/product/get-product-by-slug.use-case";
import { GetProductsUseCase } from "@/application/use-cases/product/get-products.use-case";
import { UpdateProductUseCase } from "@/application/use-cases/product/update-product.use-case";
import type { ICartRepository } from "@/domain/repositories/cart.repository";
import type { IProductRepository } from "@/domain/repositories/product.repository";
import { RedisCacheService } from "@/infrastructure/cache/redis-cache.service";
import { PrismaCartRepository } from "@/infrastructure/persistence/prisma/cart.repository.impl";
import { PrismaProductRepository } from "@/infrastructure/persistence/prisma/product.repository.impl";
import { CartController } from "@/presentation/controllers/cart.controller";
import { ProductController } from "@/presentation/controllers/product.controller";

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
		const cartRepository: ICartRepository = new PrismaCartRepository();
		const cacheService: ICacheService = new RedisCacheService();

		// Register infrastructure
		this.register("productRepository", productRepository);
		this.register("cacheService", cacheService);
		this.register("cartRepository", cartRepository);

		// Application layer - Use cases
		const getProductsUseCase = new GetProductsUseCase(
			productRepository,
			cacheService,
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

		// Register use cases
		this.register("getProductsUseCase", getProductsUseCase);
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

		// Presentation layer - Controllers
		const productController = new ProductController(
			getProductsUseCase,
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

		// Register controllers
		this.register("productController", productController);
		this.register("cartController", cartController);
	}
}

// Create singleton instance and initialize
export const container = new DIContainer();
container.initialize();
