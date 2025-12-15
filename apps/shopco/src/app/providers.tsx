"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import SpinnerbLoader from "@/components/ui/SpinnerbLoader";
import { Toaster } from "@/components/ui/sonner";
import { makeStore } from "../lib/store";

type Props = {
	children: React.ReactNode;
};

const queryClient = new QueryClient();

const Providers = ({ children }: Props) => {
	const { store, persistor } = makeStore();

	return (
		<QueryClientProvider client={queryClient}>
			<Provider store={store}>
				<PersistGate
					loading={
						<div className="flex items-center justify-center h-96">
							<SpinnerbLoader className="w-10 border-2 border-gray-300 border-r-gray-600" />
						</div>
					}
					persistor={persistor}
				>
					{children}
					<Toaster />
				</PersistGate>
			</Provider>
		</QueryClientProvider>
	);
};

export default Providers;
