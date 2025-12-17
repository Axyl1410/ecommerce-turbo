"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import ProductCard from "@/components/common/ProductCard";
import { useSearchProducts } from "@/hooks/useProducts";
import { mapSearchItemsToListItems } from "@/lib/adapters/product.adapter";
import type { ProductStatusEnumType } from "@workspace/types";

export default function SearchPage() {
	const searchParams = useSearchParams();
	const router = useRouter();

	const query = searchParams.get("q") || "";
	const categoryId = searchParams.get("category") || undefined;
	const brandId = searchParams.get("brand") || undefined;
	const statusParam = searchParams.get("status");
	const status: ProductStatusEnumType | undefined = statusParam
		? (statusParam as ProductStatusEnumType)
		: undefined;
	const sortBy = searchParams.get("sortBy") || "createdAt";
	const sortOrder = searchParams.get("sortOrder") || "desc";
	const pageParam = searchParams.get("page") || "1";

	const [page, setPage] = useState(Number.parseInt(pageParam, 10));
	const limit = 12;

	const { data, isLoading, error } = useSearchProducts({
		search: query,
		page,
		limit,
		categoryId,
		brandId,
		status,
		sortBy: sortBy as "name" | "createdAt" | "updatedAt",
		sortOrder: sortOrder as "asc" | "desc",
	});

	useEffect(() => {
		setPage(Number.parseInt(pageParam, 10));
	}, [pageParam]);

	const products = data?.data?.products || [];
	const total = data?.data?.total || 0;
	const totalPages = data?.data?.totalPages || 1;
	const mappedProducts = mapSearchItemsToListItems(products);
	const hasProducts = products.length > 0;

	const handlePageChange = (newPage: number) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("page", newPage.toString());
		router.push(`/search?${params.toString()}`);
	};

	return (
		<div className="max-w-frame mx-auto px-4 py-8">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-2">Search Results</h1>
				{query && (
					<p className="text-gray-600">
						Showing results for <span className="font-semibold">"{query}"</span>
					</p>
				)}
				{!isLoading && (
					<p className="text-sm text-gray-500 mt-2">
						{total} {total === 1 ? "product" : "products"} found
					</p>
				)}
			</div>

			{/* Loading State */}
		{isLoading && (
			<div className="flex justify-center items-center py-20">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
			</div>
		)}

		{/* Error State */}
		{error && (
			<div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
				<p className="text-red-600">
					Failed to load products. Please try again later.
				</p>
			</div>
		)}

		{/* Empty State */}
		{!isLoading && !error && products.length === 0 && (
			<div className="text-center py-20">
				<p className="text-xl text-gray-600 mb-4">No products found</p>
				{query && (
					<p className="text-gray-500">
						Try adjusting your search terms or filters
					</p>
				)}
			</div>
		)}

		{/* Products Grid */}
		{!isLoading && !error && products.length > 0 && (
				<>
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
						{mappedProducts.map((product, index) => (
							<ProductCard key={products[index]?.id ?? index} data={product} />
						))}
					</div>

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="mt-12 flex justify-center items-center gap-2">
							<button
								type="button"
								onClick={() => handlePageChange(page - 1)}
								disabled={page <= 1}
								className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
							>
								Previous
							</button>

							<div className="flex gap-2">
								{Array.from({ length: totalPages }, (_, i) => i + 1).map(
									(pageNum) => {
										// Show first page, last page, current page, and pages around current
										const showPage =
											pageNum === 1 ||
											pageNum === totalPages ||
											Math.abs(pageNum - page) <= 1;

										if (!showPage && pageNum === 2) {
											return (
												<span key={pageNum} className="px-2">
													...
												</span>
											);
										}
										if (!showPage && pageNum === totalPages - 1) {
											return (
												<span key={pageNum} className="px-2">
													...
												</span>
											);
										}
										if (!showPage) {
											return null;
										}

										return (
											<button
												type="button"
												key={pageNum}
												onClick={() => handlePageChange(pageNum)}
												className={`px-4 py-2 border rounded-lg ${
													pageNum === page
														? "bg-black text-white"
														: "hover:bg-gray-50"
												}`}
											>
												{pageNum}
											</button>
										);
									},
								)}
							</div>

							<button
								type="button"
								onClick={() => handlePageChange(page + 1)}
								disabled={page >= totalPages}
								className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
							>
								Next
							</button>
						</div>
					)}
				</>
			)}
		</div>
	);
}
