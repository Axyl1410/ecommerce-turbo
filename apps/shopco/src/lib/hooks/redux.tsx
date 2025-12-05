import { useDispatch, useSelector, useStore } from "react-redux";
import type { AppDispatch, AppStore, RootState } from "../store";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export function useAppDispatch(): ReturnType<typeof useDispatch<AppDispatch>> {
	return useDispatch<AppDispatch>();
}

export function useAppSelector<TSelected = unknown>(
	selector: (state: RootState) => TSelected,
): TSelected {
	return useSelector<RootState, TSelected>(selector);
}

export function useAppStore(): ReturnType<typeof useStore<AppStore>> {
	return useStore<AppStore>();
}

// Re-export types for convenience
export type { RootState, AppDispatch, AppStore };
