"use client";

import { useQuery } from "@tanstack/react-query";
import type { ApiResponse, CategoryRow } from "@workspace/types";
import { Button } from "@workspace/ui/components/button";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";

export default function TestPage() {
	const { isLoading, data } = useQuery({
		queryKey: ["repoData"],
		queryFn: () =>
			apiClient
				.get<ApiResponse<CategoryRow>>("/categories/slug/t-shirts")
				.then((res) => res.data),
	});

	const { isLoading: isLoadingMe, data: dataMe } = useQuery({
		queryKey: ["me"],
		queryFn: () =>
			apiClient
				.get("/me")
				.then((res) => res.data),
	});

console.log(dataMe);



	const handleClick = () => {
		toast.error("Hello");
	};

	if (isLoading) return "Loading...";

	return (
		<div className="max-w-frame mx-auto">
			<h1>{data?.message}</h1>
			<p>{data?.data.id}</p>
			<p>{data?.data.slug}</p>
			<p>{data?.data.name}</p>
			<p>{data?.data.description}</p>
			<p>{data?.data.imageUrl}</p>
			<p>{data?.data.parentId}</p>
			<p>{data?.data.sortOrder}</p>
			<p>{data?.data.active}</p>
			<p>{data?.data.createdAt.toString()}</p>
			<p>{data?.data.updatedAt.toString()}</p>
			<Button onClick={handleClick}>Click me</Button>
		</div>
	);
}
