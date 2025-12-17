import Image from "next/image";
import Link from "next/link";
import React from "react";
import type { ProductListItemDTO } from "@workspace/types";
import Rating from "../ui/Rating";
import { AddToWishlistButton } from "./add-to-wishlist-button";


type ProductCardProps = {
	data: ProductListItemDTO;
};

const ProductCard = ({ data }: ProductCardProps) => {
	const productHref = `/shop/product/${data.slug}`;
	const rating = Number.isFinite(data.ratingAvg) ? data.ratingAvg : 0;
	const hasSale =
		data.salePrice !== null &&
		Number.isFinite(data.salePrice) &&
		data.salePrice < data.price;
	const displayPrice = hasSale ? data.salePrice : data.price;
	const discountPercentage =
		hasSale && data.price > 0
			? Math.round(((data.price - (data.salePrice ?? 0)) / data.price) * 100)
			: 0;

	return (
		<Link
			href={`/shop/product/${data.id}/${data.name.split(" ").join("-")}`}
			className="flex flex-col items-start aspect-auto"
		>
			<div className="bg-[#F0EEED] rounded-[13px] lg:rounded-[20px] w-full lg:max-w-[295px] aspect-square mb-2.5 xl:mb-4 overflow-hidden relative group">
				<Image
					src={data.defaultImage ?? "/images/placeholder.png"}
					width={295}
					height={298}
					className="rounded-md w-full h-full object-contain hover:scale-110 transition-all duration-500"
					alt={data.name}
					priority
				/>
				<div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
					<AddToWishlistButton
						productId={data.id}
						size="sm"
						variant="default"
					/>
				</div>
			</div>
			<strong className="text-black xl:text-xl">{data.name}</strong>
			<div className="flex items-end mb-1 xl:mb-2">
				<Rating
					initialValue={rating}
					allowFraction
					SVGclassName="inline-block"
					emptyClassName="fill-gray-50"
					size={19}
					readonly
				/>
				<span className="text-black text-xs xl:text-sm ml-[11px] xl:ml-[13px] pb-0.5 xl:pb-0">
					{rating.toFixed(1)}
					<span className="text-black/60">/5</span>
				</span>
			</div>
			<div className="flex items-center space-x-[5px] xl:space-x-2.5">
				<span className="font-bold text-black text-xl xl:text-2xl">
					${displayPrice}
				</span>
				{hasSale && (
					<span className="font-bold text-black/40 line-through text-xl xl:text-2xl">
						${data.price}
					</span>
				)}
				{discountPercentage > 0 && (
					<span className="font-medium text-[10px] xl:text-xs py-1.5 px-3.5 rounded-full bg-[#FF3333]/10 text-[#FF3333]">
						{`-${discountPercentage}%`}
					</span>
				)}
			</div>
		</Link>
	);
};

export default ProductCard;