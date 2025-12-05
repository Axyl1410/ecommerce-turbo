import type { ICacheService } from "@/application/interfaces/cache.interface";
import {
	deleteCache as deleteCacheHelper,
	deleteCacheMultiple as deleteCacheMultipleHelper,
	getCache as getCacheHelper,
	setCache as setCacheHelper,
} from "@/lib/cache.helper";

/**
 * Redis Cache Service Implementation
 * Implements ICacheService using Redis
 */
export class RedisCacheService implements ICacheService {
	async get<T>(key: string): Promise<T | null> {
		return getCacheHelper<T>(key);
	}

	async set<T>(key: string, data: T, ttl = 60): Promise<void> {
		return setCacheHelper(key, data, ttl);
	}

	async delete(key: string): Promise<void> {
		return deleteCacheHelper(key);
	}

	async deleteMultiple(keys: string[]): Promise<void> {
		return deleteCacheMultipleHelper(keys);
	}
}
