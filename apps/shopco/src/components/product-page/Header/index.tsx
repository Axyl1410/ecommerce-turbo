import React from "react";
import Rating from "@/components/ui/Rating";
import { cn, formatPrice } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import { AddToWishlistButton } from "@/components/common/add-to-wishlist-button";
import type { ProductDetailPageData } from "@/lib/adapters/productdetail.adapter";
import AddToCardSection from "./AddToCardSection";
import ColorSelection from "./ColorSelection";
import PhotoSection from "./PhotoSection";
import SizeSelection from "./SizeSelection";

const Header = ({ data }: { data: ProductDetailPageData }) => {
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
                <PhotoSection data={data} />
            </div>
            <div>
                <h1
                    className={cn([
                        integralCF.className,
                        "text-2xl md:text-[40px] md:leading-[40px] mb-3 md:mb-3.5 capitalize",
                    ])}
                >
                    {data.name}
                </h1>
                <div className="flex items-center mb-3 sm:mb-3.5">
                    <Rating
                        initialValue={rating}
                        allowFraction
                        SVGclassName="inline-block"
                        emptyClassName="fill-gray-50"
                        size={25}
                        readonly
                    />
                    <span className="text-black text-xs sm:text-sm ml-[11px] sm:ml-[13px] pb-0.5 sm:pb-0">
                        {rating.toFixed(1)}
                        <span className="text-black/60">/5</span>
                    </span>
                </div>
                <div className="flex items-center space-x-2.5 sm:space-x-3 mb-5">
                    <span className="font-bold text-black text-2xl sm:text-[32px]">
                        {formatPrice(displayPrice || 0)}
                    </span>
                    {hasSale && (
                        <span className="font-bold text-black/40 line-through text-2xl sm:text-[32px]">
                            {formatPrice(data.price)}
                        </span>
                    )}
                    {discountPercentage > 0 ? (
                        <span className="font-medium text-[10px] sm:text-xs py-1.5 px-3.5 rounded-full bg-[#FF3333]/10 text-[#FF3333]">
                            {`-${discountPercentage}%`}
                        </span>
                    ) : null}
                </div>
                <p className="text-sm sm:text-base text-black/60 mb-5">
                    {data.description ??
                        "This product is perfect for any occasion. Crafted with superior quality and style."}
                </p>
                <hr className="h-px border-t-black/10 mb-5" />
                <ColorSelection />
                <hr className="h-px border-t-black/10 my-5" />
                <SizeSelection />
                <hr className="hidden md:block h-px border-t-black/10 my-5" />
                <div className="flex gap-3 sm:gap-4">
                    <AddToCardSection data={data} />
                    <AddToWishlistButton
                        productId={data.id}
                        variant="outline"
                        showLabel
                        className="shrink-0 px-6 sm:px-8"
                    />
                </div>
            </div>
        </div>
    );
};

export default Header;
