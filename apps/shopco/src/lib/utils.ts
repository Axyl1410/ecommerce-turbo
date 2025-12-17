import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const compareArrays = (a: any[], b: any[]) => {
	return a.toString() === b.toString();
};

/**
 * Format price to currency string
 * @param price - Price in currency
 * @param currency - Currency code (default: USD)
 * @returns Formatted price string (e.g., "$99.99")
 */
export const formatPrice = (
	price: number,
	currency: string = "USD",
): string => {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency,
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	}).format(price);
};
