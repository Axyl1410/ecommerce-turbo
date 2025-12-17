"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
    ApiResponse,
    CategoryListDTO,
    ProductDetailDTO,
    ProductListDTO,
} from "@workspace/types";
import { apiClient } from "@/lib/api";
import { Button } from "@workspace/ui/components/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select";
import { Input } from "@workspace/ui/components/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@workspace/ui/components/card";
import { toast } from "sonner";

type Brand = {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
};

type BrandListResponse = {
    brands: Brand[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};

type ProductFormState = {
    id?: string;
    name: string;
    slug: string;
    description: string;
    brandId?: string;
    categoryId?: string;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
};

const emptyForm: ProductFormState = {
    name: "",
    slug: "",
    description: "",
    brandId: undefined,
    categoryId: undefined,
    status: "DRAFT",
};

export default function ProductsPage() {
    const queryClient = useQueryClient();
    const [form, setForm] = useState<ProductFormState>(emptyForm);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Load products for admin list
    const {
        data: productsData,
        isLoading: productsLoading,
        error: productsError,
    } = useQuery({
        queryKey: ["admin-products"],
        queryFn: async () => {
            const response = await apiClient.get<ApiResponse<ProductListDTO>>(
                "/products",
                {
                    params: {
                        page: 1,
                        limit: 20,
                    },
                }
            );
            return response.data.data;
        },
    });

    // Load categories for dropdown
    const { data: categoriesData } = useQuery({
        queryKey: ["admin-categories"],
        queryFn: async () => {
            const response = await apiClient.get<ApiResponse<CategoryListDTO>>(
                "/categories",
                {
                    params: {
                        page: 1,
                        limit: 100,
                        active: true,
                    },
                }
            );
            return response.data.data;
        },
    });

    // Load brands for dropdown
    const { data: brandsData } = useQuery({
        queryKey: ["admin-brands"],
        queryFn: async () => {
            const response = await apiClient.get<BrandListResponse>("/brands", {
                params: {
                    page: 1,
                    limit: 100,
                },
            });
            return response.data;
        },
    });

    // Create/Update product mutation
    const saveMutation = useMutation({
        mutationFn: async (productData: ProductFormState) => {
            if (editingId) {
                // Update existing product
                const response = await apiClient.put<ApiResponse<ProductDetailDTO>>(
                    `/products/${editingId}`,
                    productData
                );
                return response.data.data;
            } else {
                // Create new product
                const response = await apiClient.post<ApiResponse<ProductDetailDTO>>(
                    "/products",
                    productData
                );
                return response.data.data;
            }
        },
        onSuccess: () => {
            toast.success(
                editingId ? "Product updated successfully" : "Product created successfully"
            );
            queryClient.invalidateQueries({ queryKey: ["admin-products"] });
            setForm(emptyForm);
            setEditingId(null);
        },
        onError: (error: unknown) => {
            const message =
                error instanceof Error ? error.message : "Failed to save product";
            toast.error(message);
        },
    });

    // Delete product mutation
    const deleteMutation = useMutation({
        mutationFn: async (productId: string) => {
            await apiClient.delete(`/products/${productId}`);
        },
        onSuccess: () => {
            toast.success("Product deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["admin-products"] });
        },
        onError: (error: unknown) => {
            const message =
                error instanceof Error ? error.message : "Failed to delete product";
            toast.error(message);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        saveMutation.mutate(form);
    };

    const handleEdit = async (product: ProductListDTO["products"][number]) => {
        // Fetch full product details for editing
        try {
            const response = await apiClient.get<ApiResponse<ProductDetailDTO>>(
                `/products/${product.id}`
            );
            const productDetail = response.data.data;
            setForm({
                id: productDetail.id,
                name: productDetail.name,
                slug: productDetail.slug,
                description: productDetail.description || "",
                brandId: productDetail.brand?.id,
                categoryId: productDetail.category?.id,
                status: productDetail.status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
            });
            setEditingId(productDetail.id);
        } catch (error) {
            toast.error("Failed to load product details");
        }
    };

    const handleDelete = (productId: string) => {
        if (confirm("Are you sure you want to delete this product?")) {
            deleteMutation.mutate(productId);
        }
    };

    const handleCancel = () => {
        setForm(emptyForm);
        setEditingId(null);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                <p className="text-muted-foreground">
                    Manage products in the catalog
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Product Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {editingId ? "Edit Product" : "Create Product"}
                        </CardTitle>
                        <CardDescription>
                            {editingId
                                ? "Update product information"
                                : "Add a new product to the catalog"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Product Name</label>
                                <Input
                                    value={form.name}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setForm({ ...form, name: e.target.value })
                                    }
                                    placeholder="Enter product name"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Slug</label>
                                <Input
                                    value={form.slug}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setForm({ ...form, slug: e.target.value })
                                    }
                                    placeholder="product-slug"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) =>
                                        setForm({ ...form, description: e.target.value })
                                    }
                                    placeholder="Enter product description"
                                    className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Category</label>
                                <Select
                                    value={form.categoryId || ""}
                                    onValueChange={(value) =>
                                        setForm({ ...form, categoryId: value || undefined })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categoriesData?.categories?.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.name}
                                            </SelectItem>
                                        )) ?? []}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Brand</label>
                                <Select
                                    value={form.brandId || ""}
                                    onValueChange={(value) =>
                                        setForm({ ...form, brandId: value || undefined })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select brand" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {brandsData?.brands?.map((brand) => (
                                            <SelectItem key={brand.id} value={brand.id}>
                                                {brand.name}
                                            </SelectItem>
                                        )) ?? []}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <Select
                                    value={form.status}
                                    onValueChange={(value) =>
                                        setForm({
                                            ...form,
                                            status: value as "DRAFT" | "PUBLISHED" | "ARCHIVED",
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DRAFT">Draft</SelectItem>
                                        <SelectItem value="PUBLISHED">Published</SelectItem>
                                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    type="submit"
                                    disabled={saveMutation.isPending}
                                    className="flex-1"
                                >
                                    {saveMutation.isPending
                                        ? "Saving..."
                                        : editingId
                                            ? "Update Product"
                                            : "Create Product"}
                                </Button>
                                {editingId && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleCancel}
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Product List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Product List</CardTitle>
                        <CardDescription>
                            View and manage all products
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {productsLoading ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Loading products...
                            </div>
                        ) : productsError ? (
                            <div className="text-center py-8 text-destructive">
                                Error loading products
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {productsData?.products.map((product) => (
                                    <div
                                        key={product.id}
                                        className="flex items-center justify-between rounded-md border p-3"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium">{product.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {product.slug}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEdit(product)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(product.id)}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {productsData?.products.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No products found
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

