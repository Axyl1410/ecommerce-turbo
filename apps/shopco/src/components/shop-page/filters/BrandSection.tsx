import { useBrands } from "@/hooks/useBrands";

type BrandSectionProps = {
	selectedBrandIds: string[];
	onSelectBrands: (brandIds: string[]) => void;
};

const BrandSection = ({
	selectedBrandIds,
	onSelectBrands,
}: BrandSectionProps) => {
	const { data, isLoading } = useBrands({
		active: true,
		limit: 50,
		sortBy: "name",
		sortOrder: "asc",
	});

	const brands = data?.data?.brands ?? [];

	const handleBrandToggle = (brandId: string) => {
		if (selectedBrandIds.includes(brandId)) {
			onSelectBrands(selectedBrandIds.filter((id) => id !== brandId));
		} else {
			onSelectBrands([...selectedBrandIds, brandId]);
		}
	};

	if (isLoading) {
		return (
			<div className="flex flex-col space-y-5">
				<span className="font-bold text-base">Brands</span>
				<p className="text-sm text-black/60">Loading brands...</p>
			</div>
		);
	}

	if (brands.length === 0) {
		return null;
	}

	return (
		<div className="flex flex-col space-y-5">
			<span className="font-bold text-base">Brands</span>
			<div className="flex flex-col space-y-3 max-h-[300px] overflow-y-auto">
				{brands.map((brand) => (
					<label
						key={brand.id}
						htmlFor={`brand-${brand.id}`}
						className="flex items-center space-x-2 cursor-pointer group"
					>
						<input
							type="checkbox"
							id={`brand-${brand.id}`}
							checked={selectedBrandIds.includes(brand.id)}
							onChange={() => handleBrandToggle(brand.id)}
							className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black focus:ring-2 cursor-pointer"
						/>
						<span className="text-sm text-black/60 group-hover:text-black transition-colors">
							{brand.name}
						</span>
					</label>
				))}
			</div>
		</div>
	);
};

export default BrandSection;
