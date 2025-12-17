import type { FilterState } from "@/app/(shop)/shop/page";
import BrandSection from "./BrandSection";
import CategoriesSection from "@/components/shop-page/filters/CategoriesSection";
import PriceSection from "./PriceSection";
import SizeSection from "./SizeSection";
import { Button } from "@/components/ui/button";

type FiltersProps = {
	filters: FilterState;
	onFiltersChange: (filters: FilterState) => void;
	onCategoryChange: (categoryId?: string) => void;
	onBrandsChange: (brandIds: string[]) => void;
	onApply: () => void;
	onClear: () => void;
};

const Filters = ({ filters, onFiltersChange, onCategoryChange, onBrandsChange, onApply, onClear }: FiltersProps) => {
	const hasActiveFilters = 
		filters.categoryId || 
		filters.brandIds.length > 0 || 
		(filters.priceRange[0] !== 0 || filters.priceRange[1] !== 250) ||
		filters.sizes.length > 0;

	return (
		<>
			<hr className="border-t-black/10" />
			<CategoriesSection
				selectedCategoryId={filters.categoryId}
				onSelectCategory={onCategoryChange}
			/>
			<hr className="border-t-black/10" />
			<BrandSection
				selectedBrandIds={filters.brandIds}
				onSelectBrands={onBrandsChange}
			/>
			<hr className="border-t-black/10" />
			<PriceSection
				priceRange={filters.priceRange}
				onPriceChange={(priceRange) => onFiltersChange({ ...filters, priceRange })}
			/>
			<hr className="border-t-black/10" />
			<SizeSection
				selectedSizes={filters.sizes}
				onSizesChange={(sizes) => onFiltersChange({ ...filters, sizes })}
			/>
			<div className="space-y-2">
				<Button
					type="button"
					onClick={onApply}
					className="bg-black w-full rounded-full text-sm font-medium py-4 h-12"
				>
					Apply Filter
				</Button>
				{hasActiveFilters && (
					<Button
						type="button"
						onClick={onClear}
						variant="outline"
						className="w-full rounded-full text-sm font-medium py-4 h-12"
					>
						Clear Filters
					</Button>
				)}
			</div>
		</>
	);
};

export default Filters;
