import React from "react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";

type PriceSectionProps = {
	priceRange: [number, number];
	onPriceChange: (range: [number, number]) => void;
};

const PriceSection = ({ priceRange, onPriceChange }: PriceSectionProps) => {
	return (
		<Accordion type="single" collapsible defaultValue="filter-price">
			<AccordionItem value="filter-price" className="border-none">
				<AccordionTrigger className="text-black font-bold text-xl hover:no-underline p-0 py-0.5">
					Price
				</AccordionTrigger>
				<AccordionContent className="pt-4" contentClassName="overflow-visible">
					<Slider
						value={priceRange}
						onValueChange={(value) => onPriceChange(value as [number, number])}
						min={0}
						max={250}
						step={1}
						label="$"
					/>
					<div className="mb-3" />
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
};

export default PriceSection;
