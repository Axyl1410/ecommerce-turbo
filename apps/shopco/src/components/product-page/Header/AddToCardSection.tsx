"use client";

import React, { useState } from "react";
import CartCounter from "@/components/ui/CartCounter";
import type { Product } from "@/types/product.types";
import AddToCartBtn from "./AddToCartBtn";

const AddToCardSection = ({ data }: { data: Product }) => {
	const [quantity, setQuantity] = useState<number>(1);

	return (
		<div className="fixed md:relative w-full bg-white border-t md:border-none border-black/5 bottom-0 left-0 p-4 md:p-0 z-10 flex items-center justify-between sm:justify-start md:justify-center">
			<CartCounter onAdd={setQuantity} onRemove={setQuantity} />
			<AddToCartBtn data={{ ...data, quantity }} />
		</div>
	);
};

export default AddToCardSection;
