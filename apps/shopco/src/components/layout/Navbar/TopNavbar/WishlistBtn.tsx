"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useWishlist } from "@/hooks/use-wishlist";

const WishlistBtn = () => {
    const { wishlist } = useWishlist();

    return (
        <Link href="/wishlist" className="relative mr-[14px] p-1" title="Wishlist">
            <Heart className="h-[22px] w-[22px] text-foreground" />
            {wishlist.length > 0 && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border bg-red-500 px-1 text-xs text-white">
                    {wishlist.length}
                </span>
            )}
        </Link>
    );
};

export default WishlistBtn;
