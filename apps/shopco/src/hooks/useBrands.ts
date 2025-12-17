import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { ApiResponse } from "@workspace/types";
import {
	brandService,
	type BrandListDTO,
	type GetBrandsDTO,
} from "@/lib/services/brand.service";

/**
 * Hook for fetching brands list
 */
export function useBrands(
	params?: GetBrandsDTO,
): UseQueryResult<ApiResponse<BrandListDTO>, Error> {
	return useQuery<ApiResponse<BrandListDTO>, Error>({
		queryKey: ["brands", params],
		queryFn: () => brandService.getBrands(params),
		staleTime: 1000 * 60 * 10, // 10 minutes - brands change infrequently
		retry: 2,
	});
}
