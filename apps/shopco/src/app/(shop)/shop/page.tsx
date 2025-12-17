"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { FiSliders } from "react-icons/fi";
import type { ApiResponse, ProductListDTO } from "@workspace/types";
import ProductCard from "@/components/common/ProductCard";
import BreadcrumbShop from "@/components/shop-page/BreadcrumbShop";
import Filters from "@/components/shop-page/filters";
import MobileFilters from "@/components/shop-page/filters/MobileFilters";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api";

export default function ShopPage() {
	const searchParams = useSearchParams();

	const page = useMemo(() => Number(searchParams.get("page")) || 1, [searchParams]);
	const limit = useMemo(() => Number(searchParams.get("limit")) || 9, [searchParams]);
	const sortBy = useMemo(
		() => (searchParams.get("sortBy") as "name" | "createdAt" | "updatedAt") || "createdAt",
		[searchParams],
	);
	const sortOrder = useMemo(
		() => (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
		[searchParams],
	);

	const { data, isLoading, error } = useQuery({
		queryKey: ["products", page, limit, sortBy, sortOrder],
		queryFn: () =>
			apiClient
				.get<ApiResponse<ProductListDTO>>("/products", {
					params: {
						page,
						limit,
						sortBy,
						sortOrder,
						status: "PUBLISHED",
					},
				})
				.then((res) => res.data.data),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	const handleSortChange = (value: string) => {
		const [newSortBy, newSortOrder] = value.split(":") as [
			"name" | "createdAt" | "updatedAt",
			"asc" | "desc",
		];
		const params = new URLSearchParams();
		params.set("page", "1");
		params.set("limit", String(limit));
		params.set("sortBy", newSortBy);
		params.set("sortOrder", newSortOrder);
		window.history.pushState(null, "", `?${params.toString()}`);
		window.location.href = `?${params.toString()}`;
	};

	const handlePageChange = (newPage: number) => {
		const params = new URLSearchParams();
		params.set("page", String(newPage));
		params.set("limit", String(limit));
		params.set("sortBy", sortBy);
		params.set("sortOrder", sortOrder);
		window.scrollTo({ top: 0, behavior: "smooth" });
		window.history.pushState(null, "", `?${params.toString()}`);
		window.location.href = `?${params.toString()}`;
	};

	if (error) {
		return (
			<main className="pb-20">
				<div className="max-w-frame mx-auto px-4 xl:px-0">
					<div className="text-center py-20">
						<p className="text-red-600">Failed to load products. Please try again.</p>
					</div>
				</div>
			</main>
		);
	}

	const totalProducts = data?.total ?? 0;
	const displayProducts = data?.products ?? [];
	const totalPages = data?.totalPages ?? 1;
	const startIndex = (page - 1) * limit + 1;
	const endIndex = Math.min(page * limit, totalProducts);

	return (
		<main className="pb-20">
			<div className="max-w-frame mx-auto px-4 xl:px-0">
				<hr className="h-px border-t-black/10 mb-5 sm:mb-6" />
				<BreadcrumbShop />
				<div className="flex md:space-x-5 items-start">
					<div className="hidden md:block min-w-[295px] max-w-[295px] border border-black/10 rounded-[20px] px-5 md:px-6 py-5 space-y-5 md:space-y-6">
						<div className="flex items-center justify-between">
							<span className="font-bold text-black text-xl">Filters</span>
							<FiSliders className="text-2xl text-black/40" />
						</div>
						<Filters />
					</div>
					<div className="flex flex-col w-full space-y-5">
						<div className="flex flex-col lg:flex-row lg:justify-between">
							<div className="flex items-center justify-between">
								<h1 className="font-bold text-2xl md:text-[32px]">Shop</h1>
								<MobileFilters />
							</div>
							<div className="flex flex-col sm:items-center sm:flex-row gap-3">
								<span className="text-sm md:text-base text-black/60">
									{isLoading ? (
										"Loading..."
									) : (
										<>
											Showing {startIndex}-{endIndex} of {totalProducts} Products
										</>
									)}
								</span>
								<div className="flex items-center">
									Sort by:{" "}
									<Select
										defaultValue={`${sortBy}:${sortOrder}`}
										onValueChange={handleSortChange}
									>
										<SelectTrigger className="font-medium text-sm px-1.5 sm:text-base w-fit text-black bg-transparent shadow-none border-none">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="createdAt:desc">Newest</SelectItem>
											<SelectItem value="createdAt:asc">Oldest</SelectItem>
											<SelectItem value="name:asc">Name (A-Z)</SelectItem>
											<SelectItem value="name:desc">Name (Z-A)</SelectItem>
											<SelectItem value="updatedAt:desc">Recently Updated</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						</div>
						<div className="w-full grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 min-h-[400px]">
							{isLoading ? (
								<div className="col-span-full text-center py-20">
									<p className="text-black/60">Loading products...</p>
								</div>
							) : displayProducts.length === 0 ? (
								<div className="col-span-full text-center py-20">
									<p className="text-black/60">No products found</p>
								</div>
							) : (
								displayProducts.map((product) => (
									<ProductCard key={product.id} data={product} />
								))
							)}
						</div>
						<hr className="border-t-black/10" />
						{totalPages > 1 && (
							<Pagination className="justify-between">
								<PaginationPrevious
									href="#"
									onClick={(e) => {
										e.preventDefault();
										if (page > 1) handlePageChange(page - 1);
									}}
									className={`border border-black/10 ${page === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
								/>
								<PaginationContent>
									{Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
										const pageNum = i + 1;
										return (
											<PaginationItem key={pageNum}>
												<PaginationLink
													href="#"
													onClick={(e) => {
														e.preventDefault();
														handlePageChange(pageNum);
													}}
													className="text-black/50 font-medium text-sm"
													isActive={pageNum === page}
												>
													{pageNum}
												</PaginationLink>
											</PaginationItem>
										);
									})}
									{totalPages > 5 && (
										<PaginationItem>
											<PaginationEllipsis className="text-black/50 font-medium text-sm" />
										</PaginationItem>
									)}
								</PaginationContent>

								<PaginationNext
									href="#"
									onClick={(e) => {
										e.preventDefault();
										if (page < totalPages) handlePageChange(page + 1);
									}}
									className={`border border-black/10 ${page === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
								/>
							</Pagination>
						)}
					</div>
				</div>
			</div>
		</main>
	);
}
