import axios from "axios";

/**
 * Backend API Configuration
 *
 * The API base URL is configured via environment variables.
 * For Next.js, use NEXT_PUBLIC_ prefix to expose variables to the browser.
 *
 * Example .env.local:
 * NEXT_PUBLIC_API_URL=http://localhost:8080
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const API_VERSION = "/api/v1";

/**
 * Full API base URL including version
 */
export const API_URL = `${API_BASE_URL}${API_VERSION}`;

/**
 * Axios instance configured with base URL
 * Use this for all API calls instead of creating new axios instances
 */
export const apiClient = axios.create({
	baseURL: API_URL,
	headers: {
		"Content-Type": "application/json",
	},
	timeout: 10000, // 10 seconds
});

/**
 * Request interceptor (optional)
 * Can be used to add auth tokens, etc.
 */
apiClient.interceptors.request.use(
	(config) => {
		// Add auth token if available
		// const token = localStorage.getItem('token');
		// if (token) {
		//   config.headers.Authorization = `Bearer ${token}`;
		// }
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

/**
 * Response interceptor (optional)
 * Can be used to handle errors globally
 */
apiClient.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		// Handle errors globally
		// if (error.response?.status === 401) {
		//   // Handle unauthorized
		// }
		return Promise.reject(error);
	},
);

export default apiClient;
