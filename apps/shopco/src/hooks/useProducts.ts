import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type {
	ApiResponse,
	GetProductsDTO,
	ProductDTO,
	ProductSearchListDTO,
} from "@workspace/types";
import { productService } from "@/lib/services/product.service";

/**
 * Hook for searching and listing products with filters (includes prices)
 */
export function useSearchProducts(
	params: GetProductsDTO,
): UseQueryResult<ApiResponse<ProductSearchListDTO>, Error> {
	return useQuery<ApiResponse<ProductSearchListDTO>, Error> ({
		queryKey: ["products", "search", params],
		queryFn: () => productService.searchProducts(params),
		staleTime: 1000 * 60 * 5, // 5 minutes
		retry: 2,
	});
}

/**
 * Hook for fetching a single product by ID
 */
export function useProduct(
	id: string,
	enabled = true,
): UseQueryResult<ApiResponse<ProductDTO>, Error> {
	return useQuery<ApiResponse<ProductDTO>, Error>({
		queryKey: ["products", id],
		queryFn: () => productService.getProductById(id),
		enabled: enabled && !!id,
		staleTime: 1000 * 60 * 10, // 10 minutes
	});
}

/**
 * Hook for fetching a single product by slug
 */
export function useProductBySlug(
	slug: string,
	enabled = true,
): UseQueryResult<ApiResponse<ProductDTO>, Error> {
	return useQuery<ApiResponse<ProductDTO>, Error>({
		queryKey: ["products", "slug", slug],
		queryFn: () => productService.getProductBySlug(slug),
		enabled: enabled && !!slug,
		staleTime: 1000 * 60 * 10, // 10 minutes
	});
}
