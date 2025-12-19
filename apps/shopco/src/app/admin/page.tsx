"use client";

import { useQuery } from "@tanstack/react-query";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { admin } from "@/lib/auth-client";
import { apiClient } from "@/lib/api";
import type { ApiResponse, ProductListDTO } from "@workspace/types";
import { Users, Package, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
	// Fetch users count
	const { data: usersData } = useQuery({
		queryKey: ["admin-users-count"],
		queryFn: async () => {
			const result = await admin.listUsers({
				query: {
					limit: 1,
					offset: 0,
				},
			});
			return result?.data;
		},
	});

	// Fetch products count
	const { data: productsData } = useQuery({
		queryKey: ["admin-products-count"],
		queryFn: async () => {
			const response = await apiClient.get<ApiResponse<ProductListDTO>>(
				"/products",
				{
					params: {
						page: 1,
						limit: 1,
					},
				}
			);
			return response.data.data;
		},
	});

	const totalUsers = usersData?.total ?? 0;
	const totalProducts = productsData?.total ?? 0;

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
				<p className="text-muted-foreground">
					Overview of your admin panel
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Users</CardTitle>
						<Users className="size-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalUsers}</div>
						<p className="text-xs text-muted-foreground">
							Registered users in the system
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Products</CardTitle>
						<Package className="size-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalProducts}</div>
						<p className="text-xs text-muted-foreground">
							Products in the catalog
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
						<TrendingUp className="size-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">-</div>
						<p className="text-xs text-muted-foreground">
							Manage users and products
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
