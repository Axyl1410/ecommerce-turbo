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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import InputGroup from "@/components/ui/input-group";

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

export default function AdminPage() {
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
      const response = await apiClient.get<ApiResponse<BrandListResponse>>(
        "/brands",
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

  // Create product
  const createMutation = useMutation({
    mutationFn: async (payload: ProductFormState) => {
      const response = await apiClient.post<ApiResponse<ProductDetailDTO>>(
        "/products",
        {
          name: payload.name,
          slug: payload.slug,
          description: payload.description || null,
          brandId: payload.brandId || null,
          categoryId: payload.categoryId || null,
          status: payload.status,
          // For demo we create product without variants/images
          variants: [],
          images: [],
        }
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setForm(emptyForm);
    },
  });

  // Update product
  const updateMutation = useMutation({
    mutationFn: async (payload: ProductFormState) => {
      if (!payload.id) return;

      const response = await apiClient.put<ApiResponse<ProductDetailDTO>>(
        `/products/${payload.id}`,
        {
          name: payload.name,
          slug: payload.slug,
          description: payload.description || null,
          brandId: payload.brandId || null,
          categoryId: payload.categoryId || null,
          status: payload.status,
        }
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setForm(emptyForm);
      setEditingId(null);
    },
  });

  // Delete product
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete<ApiResponse<null>>(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });

  const products = productsData?.products ?? [];
  const categories = categoriesData?.categories ?? [];
  const brands = brandsData?.brands ?? [];

  const isSaving = createMutation.isPending || updateMutation.isPending;

  function handleChange<K extends keyof ProductFormState>(
    key: K,
    value: ProductFormState[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function handleEdit(product: (typeof products)[number]) {
    setEditingId(product.id);
    setForm({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: "",
      brandId: (product as any).brandId ?? undefined,
      categoryId: (product as any).categoryId ?? undefined,
      status: "PUBLISHED",
    });
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (editingId) {
      updateMutation.mutate(form);
    } else {
      createMutation.mutate(form);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-semibold mb-4">Admin - Quản lý sản phẩm</h1>

      <section className="border rounded-lg p-4 space-y-4">
        <h2 className="text-lg font-medium">
          {editingId ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Tên sản phẩm</label>
              <InputGroup className="bg-[#F0F0F0] rounded-md">
                <InputGroup.Input
                  type="text"
                  value={form.name}
                  placeholder="Nhập tên sản phẩm"
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
              </InputGroup>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Slug</label>
              <InputGroup className="bg-[#F0F0F0] rounded-md">
                <InputGroup.Input
                  type="text"
                  value={form.slug}
                  placeholder="vd: ao-thun-basic"
                  onChange={(e) => handleChange("slug", e.target.value)}
                  required
                />
              </InputGroup>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Mô tả ngắn</label>
            <InputGroup className="bg-[#F0F0F0] rounded-md">
              <InputGroup.Input
                type="text"
                value={form.description}
                placeholder="Mô tả sản phẩm"
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </InputGroup>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Thương hiệu</label>
              <Select
                value={form.brandId ?? "none"}
                onValueChange={(value) =>
                  handleChange("brandId", value === "none" ? undefined : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn thương hiệu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không có</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Danh mục</label>
              <Select
                value={form.categoryId ?? "none"}
                onValueChange={(value) =>
                  handleChange(
                    "categoryId",
                    value === "none" ? undefined : value
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không có</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Trạng thái</label>
              <Select
                value={form.status}
                onValueChange={(value) =>
                  handleChange("status", value as ProductFormState["status"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Nháp</SelectItem>
                  <SelectItem value="PUBLISHED">Đã xuất bản</SelectItem>
                  <SelectItem value="ARCHIVED">Lưu trữ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSaving}>
              {editingId ? "Lưu thay đổi" : "Tạo sản phẩm"}
            </Button>
            {editingId && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
              >
                Hủy chỉnh sửa
              </Button>
            )}
          </div>
        </form>
      </section>

      <section className="border rounded-lg p-4 space-y-4">
        <h2 className="text-lg font-medium">Danh sách sản phẩm</h2>
        {productsLoading && <p>Đang tải sản phẩm...</p>}
        {productsError ? (
          <p className="text-red-500">Không thể tải danh sách sản phẩm.</p>
        ) : null}
        {!productsLoading && !productsError && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-4">Tên</th>
                  <th className="py-2 pr-4">Slug</th>
                  <th className="py-2 pr-4">Giá thấp nhất</th>
                  <th className="py-2 pr-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b">
                    <td className="py-2 pr-4">{product.name}</td>
                    <td className="py-2 pr-4">{product.slug}</td>
                    <td className="py-2 pr-4">
                      {product.price?.toLocaleString("vi-VN")} đ
                    </td>
                    <td className="py-2 pr-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product as any)}
                        >
                          Sửa
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteMutation.mutate(product.id)}
                        >
                          Xóa
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
