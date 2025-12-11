declare module "@workspace/types" {
	export type ApiResponse<T> = {
		status: number | string;
		message: string;
		data: T;
		errorCode?: string;
	};

	export type Paginated<T> = {
		items: T[];
		total: number;
		page: number;
		pageSize: number;
	};
}
