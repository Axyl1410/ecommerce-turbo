import { notFound } from "next/navigation";
import {
	newArrivalsData,
	relatedProductData,
	topSellingData,
} from "@/app/page";
import ProductListSec from "@/components/common/ProductListSec";
import BreadcrumbProduct from "@/components/product-page/BreadcrumbProduct";
import Header from "@/components/product-page/Header";
import Tabs from "@/components/product-page/Tabs";
import type { Product } from "@/types/product.types";

const data: Product[] = [
	...newArrivalsData,
	...topSellingData,
	...relatedProductData,
];

export default async function ProductPage(props: {
	params: Promise<{ slug: string[] }>;
}) {
	const params = await props.params;
	const productData = data.find(
		(product) => product.id === Number(params.slug[0]),
	);

	if (!productData?.title) {
		notFound();
	}

	return (
		<main>
			<div className="max-w-frame mx-auto px-4 xl:px-0">
				<hr className="h-px border-t-black/10 mb-5 sm:mb-6" />
				<BreadcrumbProduct title={productData?.title ?? "product"} />
				<section className="mb-11">
					<Header data={productData} />
				</section>
				<Tabs />
			</div>
			<div className="mb-[50px] sm:mb-20">
				<ProductListSec title="You might also like" data={relatedProductData} />
			</div>
		</main>
	);
}
