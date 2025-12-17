import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { ApiResponse, CategoryListDTO, GetCategoriesDTO } from "@workspace/types";
import { categoryService } from "@/lib/services/category.service";

/**
 * Hook for fetching categories list
 */
export function useCategories(
	params?: GetCategoriesDTO,
): UseQueryResult<ApiResponse<CategoryListDTO>, Error> {
	return useQuery<ApiResponse<CategoryListDTO>, Error>({
		queryKey: ["categories", params],
		queryFn: () => categoryService.getCategories(params),
		staleTime: 1000 * 60 * 10, // 10 minutes - categories change infrequently
		retry: 2,
	});
}

/**
 * Hook for fetching a single category by ID
 */
export function useCategory(
	id: string,
	enabled = true,
): UseQueryResult<ApiResponse<unknown>, Error> {
	return useQuery<ApiResponse<unknown>, Error>({
		queryKey: ["categories", id],
		queryFn: () => categoryService.getCategoryById(id),
		enabled: enabled && !!id,
		staleTime: 1000 * 60 * 10,
	});
}

/**
 * Hook for fetching a single category by slug
 */
export function useCategoryBySlug(
	slug: string,
	enabled = true,
): UseQueryResult<ApiResponse<unknown>, Error> {
	return useQuery<ApiResponse<unknown>, Error>({
		queryKey: ["categories", "slug", slug],
		queryFn: () => categoryService.getCategoryBySlug(slug),
		enabled: enabled && !!slug,
		staleTime: 1000 * 60 * 10,
	});
}
