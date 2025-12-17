import { notFound } from "next/navigation";
import ProductListSec from "@/components/common/ProductListSec";
import BreadcrumbProduct from "@/components/product-page/BreadcrumbProduct";
import Header from "@/components/product-page/Header";
import Tabs from "@/components/product-page/Tabs";
import { mapProductDetailDTO } from "@/lib/adapters/productdetail.adapter";
import { productService } from "@/lib/services/product.service";

export default async function ProductPage(props: {
	params: Promise<{ slug: string[] }>;
}) {
	const params = await props.params;
	const productSlug = params.slug[0];

	if (!productSlug) {
		notFound();
	}

	try {
		const response = await productService.getProductBySlug(productSlug);

		if ( !response.data) {
			notFound();
		}

		const productData = mapProductDetailDTO(response.data);

		return (
			<main>
				<div className="max-w-frame mx-auto px-4 xl:px-0">
					<hr className="h-px border-t-black/10 mb-5 sm:mb-6" />
					<BreadcrumbProduct title={productData.name} />
					<section className="mb-11">
						<Header data={productData} />
					</section>
					<Tabs />
				</div>
				<div className="mb-[50px] sm:mb-20">
					{/* TODO: Implement related products from API */}
				</div>
			</main>
		);
	} catch (error) {
		console.error("Failed to fetch product:", error);
		notFound();
	}
}
