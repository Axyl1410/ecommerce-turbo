import type {
    ProductDTO,
    ProductSearchItemDTO,
    ProductListItemDTO,
} from "@workspace/types";
import type { Product } from "@/types/product.types";

/**
 * Maps backend ProductSearchItemDTO to ProductListItemDTO for ProductCard
 */
export function mapSearchItemToListItem(
    dto: ProductSearchItemDTO,
): ProductListItemDTO {
    return {
        id: dto.id,
        name: dto.name,
        slug: dto.slug,
        defaultImage: dto.defaultImage,
        price: Math.round(dto.price * 100) / 100,
        salePrice: dto.salePrice ? Math.round(dto.salePrice * 100) / 100 : null,
        ratingAvg: 0, // Backend doesn't provide rating in search yet
        ratingCount: 0,
    };
}

/**
 * Maps backend ProductSearchItemDTO (with price) to frontend Product type
 */
export function mapProductSearchItemToProduct(
    dto: ProductSearchItemDTO,
): Product {
    // Try to parse ID as number, fallback to hash of string ID for uniqueness
    const numericId = Number.parseInt(dto.id, 10);
    const id = Number.isNaN(numericId)
        ? Math.abs(hashString(dto.id))
        : numericId;

    // Round prices to 2 decimal places to avoid floating point errors
    const price = Math.round(dto.price * 100) / 100;
    const salePrice = dto.salePrice
        ? Math.round(dto.salePrice * 100) / 100
        : null;

    const discount =
        salePrice && salePrice < price
            ? {
                    amount: price - salePrice,
                    percentage: Math.round(((price - salePrice) / price) * 100),
                }
            : { amount: 0, percentage: 0 };

    return {
        id,
        title: dto.name,
        srcUrl: dto.defaultImage || "/images/placeholder-product.png",
        gallery: [],
        price: salePrice || price, // Use sale price if available
        discount,
        rating: 0, // Backend doesn't provide rating yet
    };
}

/**
 * Fallback for basic ProductDTO without price info
 */
export function mapProductDTOToProduct(dto: ProductDTO): Product {
    const numericId = Number.parseInt(dto.id, 10);
    const id = Number.isNaN(numericId)
        ? Math.abs(hashString(dto.id))
        : numericId;

    return {
        id,
        title: dto.name,
        srcUrl: dto.defaultImage || "/images/placeholder-product.png",
        gallery: [],
        price: 0,
        discount: { amount: 0, percentage: 0 },
        rating: 0,
    };
}

/**
 * Simple string hash function for creating numeric IDs from UUIDs
 */
function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

/**
 * Maps array of ProductSearchItemDTOs to ProductListItemDTOs
 */
export function mapSearchItemsToListItems(
    dtos: ProductSearchItemDTO[],
): ProductListItemDTO[] {
    return dtos.map(mapSearchItemToListItem);
}

/**
 * Maps array of ProductSearchItemDTOs to frontend Products
 */
export function mapProductSearchItemsToProducts(
    dtos: ProductSearchItemDTO[],
): Product[] {
    return dtos.map(mapProductSearchItemToProduct);
}

/**
 * Maps array of ProductDTOs to frontend Products (fallback)
 */
export function mapProductDTOsToProducts(dtos: ProductDTO[]): Product[] {
    return dtos.map(mapProductDTOToProduct);
}

import type { ProductDetailDTO } from "@workspace/types";

export interface ProductDetailPageData {
  id: string;
  name: string;
  slug: string;
  defaultImage: string | null;
  description: string | null;
  price: number;
  salePrice: number | null;
  ratingAvg: number;
  ratingCount: number;
  gallery: string[];
  variants: Array<{
    id: string;
    sku: string | null;
    attributes: Record<string, unknown> | null;
    price: number;
    salePrice: number | null;
    stockQuantity: number;
    images: Array<{
      id: string;
      url: string;
      altText: string | null;
    }>;
  }>;
  category: { id: string; name: string; slug: string } | null;
  brand: { id: string; name: string; slug: string } | null;
}

export function mapProductDetailDTO(dto: ProductDetailDTO): ProductDetailPageData {
  const productImages = dto.images.filter((img) => !img.variantId).map((img) => img.url);
  const variantImages = dto.variants.flatMap((v) => v.images.map((img) => img.url));
  const gallery = productImages.length > 0 ? productImages : variantImages;

  const firstVariant = dto.variants[0];
  const price = firstVariant?.price ?? 0;
  const salePrice = firstVariant?.salePrice ?? null;

  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    defaultImage: dto.defaultImage,
    description: dto.description,
    price,
    salePrice,
    ratingAvg: 0,
    ratingCount: 0,
    gallery,
    variants: dto.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      attributes: v.attributes,
      price: v.price,
      salePrice: v.salePrice,
      stockQuantity: v.stockQuantity,
      images: v.images.map((img) => ({
        id: img.id,
        url: img.url,
        altText: img.altText,
      })),
    })),
    category: dto.category
      ? { id: dto.category.id, name: dto.category.name, slug: dto.category.slug }
      : null,
    brand: dto.brand ? { id: dto.brand.id, name: dto.brand.name, slug: dto.brand.slug } : null,
  };
}
