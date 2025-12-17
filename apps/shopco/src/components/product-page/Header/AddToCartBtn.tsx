"use client";

import React from "react";
import { addToCart } from "@/lib/features/carts/cartsSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import type { RootState } from "@/lib/store";
import type { ProductListItemDTO } from "@workspace/types";

type ProductDetailData = ProductListItemDTO & { quantity: number; gallery?: string[] };

const AddToCartBtn = ({ data }: { data: ProductDetailData }) => {
	const dispatch = useAppDispatch();
	const { sizeSelection, colorSelection } = useAppSelector(
		(state: RootState) => state.products,
	);

	const hasSale =
		data.salePrice !== null &&
		Number.isFinite(data.salePrice) &&
		data.salePrice < data.price;
	const discountPercentage =
		hasSale && data.price > 0
			? Math.round(((data.price - (data.salePrice ?? 0)) / data.price) * 100)
			: 0;

	return (
		<button
			type="button"
			className="bg-black w-full ml-3 sm:ml-5 rounded-full h-11 md:h-[52px] text-sm sm:text-base text-white hover:bg-black/80 transition-all"
			onClick={() =>
				dispatch(
					addToCart({
						id: data.id,
						name: data.name,
						slug: data.slug,
						srcUrl: data.defaultImage ?? "/images/placeholder.png",
						price: data.price,
						attributes: [sizeSelection, colorSelection.name],
						discount: { amount: 0, percentage: discountPercentage },
						quantity: data.quantity,
					}),
				)
			}
		>
			Add to Cart
		</button>
	);
};

export default AddToCartBtn;
