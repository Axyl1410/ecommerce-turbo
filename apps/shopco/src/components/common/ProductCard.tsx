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
            href={`/shop/product/${data.slug}`}
            className="flex flex-col items-start aspect-auto"
        >
            <div className="relative bg-[#F0EEED] rounded-[20px] overflow-hidden mb-4 w-full aspect-[295/298] group">
                <Image
                    src={data.defaultImage || "/images/placeholder.png"}
                    alt={data.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <AddToWishlistButton productId={data.id} size="icon" />
                </div>
            </div>
            <h3 className="font-bold text-lg sm:text-xl text-black capitalize mb-2 line-clamp-1 hover:text-black/70 transition-colors">
                {data.name}
            </h3>
            <div className="flex items-center mb-2">
                <Rating
                    initialValue={rating}
                    allowFraction
                    SVGclassName="inline-block"
                    emptyClassName="fill-gray-50"
                    size={19}
                    readonly
                />
                <span className="text-black text-sm ml-[13px]">
                    {rating.toFixed(1)}
                    <span className="text-black/60">/5</span>
                </span>
            </div>
            <div className="flex items-center gap-2.5">
                <span className="font-bold text-2xl text-black">
                    ${displayPrice?.toFixed(2)}
                </span>
                {hasSale && (
                    <>
                        <span className="font-bold text-2xl line-through text-black/40">
                            ${data.price.toFixed(2)}
                        </span>
                        <span className="font-medium text-xs py-1.5 px-3.5 rounded-full bg-[#FF3333]/10 text-[#FF3333]">
                            -{discountPercentage}%
                        </span>
                    </>
                )}
            </div>
        </Link>
    );
};

export default ProductCard;