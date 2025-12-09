"use client";

import { useQuery } from "@tanstack/react-query";
import type { ApiResponse } from "@workspace/types";
import axios from "axios";

export default function TestPage() {
	const { isLoading, data } = useQuery({
		queryKey: ["repoData"],
		queryFn: () =>
			axios
				.get<ApiResponse<{ id: string; name: string }>>(
					"http://localhost:8080/api/v1/categories/slug/t-shirts",
				)
				.then((res) => res.data),
	});

	console.table(data);

	if (isLoading) return "Loading...";

	return (
		<div className="max-w-frame mx-auto">
			<h1>{data?.message}</h1>
			<p>{data?.data.name}</p>
		</div>
	);
}
