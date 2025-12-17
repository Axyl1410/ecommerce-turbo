import { MdKeyboardArrowRight } from "react-icons/md";
import { useCategories } from "@/hooks/useCategories";

type CategoriesSectionProps = {
	selectedCategoryId?: string;
	onSelectCategory: (categoryId?: string) => void;
};

const CategoriesSection = ({
	selectedCategoryId,
	onSelectCategory,
}: CategoriesSectionProps) => {
	const { data, isLoading } = useCategories({
		active: true,
		limit: 20,
		sortBy: "name",
		sortOrder: "asc",
	});

	const categories = data?.data?.categories ?? [];

	if (isLoading) {
		return (
			<div className="flex flex-col space-y-0.5 text-black/60">
				<p className="text-sm">Loading categories...</p>
			</div>
		);
	}

	if (categories.length === 0) {
		return (
			<div className="flex flex-col space-y-0.5 text-black/60">
				<p className="text-sm">No categories available</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col space-y-0.5 text-black/60">
			{/* All Categories option */}
			<button
				type="button"
				onClick={() => onSelectCategory(undefined)}
				className={`flex items-center justify-between py-2 text-left transition-colors ${
					!selectedCategoryId
						? "text-black font-semibold"
						: "hover:text-black"
				}`}
			>
				All Categories <MdKeyboardArrowRight />
			</button>
			{categories.map((category) => (
				<button
					type="button"
					key={category.id}
					onClick={() => onSelectCategory(category.id)}
					className={`flex items-center justify-between py-2 text-left transition-colors ${
						selectedCategoryId === category.id
							? "text-black font-semibold"
							: "hover:text-black"
					}`}
				>
					{category.name} <MdKeyboardArrowRight />
				</button>
			))}
		</div>
	);
};

export default CategoriesSection;
