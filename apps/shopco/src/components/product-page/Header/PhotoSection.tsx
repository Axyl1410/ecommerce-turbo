"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductDetailPageData } from "@/lib/adapters/productdetail.adapter";

const PhotoSection = ({ data }: { data: ProductDetailPageData }) => {
	const images =
		data.gallery.length > 0
			? data.gallery
			: [data.defaultImage ?? "/images/placeholder.png"];
	const [selectedImage, setSelectedImage] = useState(images[0]);

	return (
		<div className="flex flex-col-reverse md:flex-row gap-3.5">
			<div className="flex md:flex-col gap-3.5 overflow-x-auto md:overflow-y-auto">
				{images.map((img, index) => (
					<button
						key={`${img}-${index}`}
						type="button"
						onClick={() => setSelectedImage(img)}
						className={`relative shrink-0 w-[111px] h-[106px] md:w-[152px] md:h-[167px] rounded-[20px] overflow-hidden border-2 transition-all ${
							selectedImage === img
								? "border-black"
								: "border-transparent hover:border-gray-300"
						}`}
					>
						<Image
							src={img}
							alt={`${data.name} thumbnail ${index + 1}`}
							fill
							className="object-cover"
						/>
					</button>
				))}
			</div>
			<div className="relative w-full aspect-square md:aspect-[444/530] bg-[#F0EEED] rounded-[20px] overflow-hidden">
				<Image
					src={selectedImage|| "/images/placeholder.png"}
					alt={data.name}
					fill
					priority
					className="object-cover"
				/>
			</div>
		</div>
	);
};

export default PhotoSection;
