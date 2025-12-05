/**
 * Cache Service Interface
 * Abstraction for caching operations
 */
export interface ICacheService {
  /**
   * Get cached value by key
   * @param key - Cache key
   * @returns Cached value or null if not found
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Set cache value with optional TTL
   * @param key - Cache key
   * @param data - Data to cache
   * @param ttl - Time to live in seconds (default: 60)
   */
  set<T>(key: string, data: T, ttl?: number): Promise<void>;

  /**
   * Delete cache by key
   * @param key - Cache key to delete
   */
  delete(key: string): Promise<void>;

  /**
   * Delete multiple cache keys
   * @param keys - Array of cache keys to delete
   */
  deleteMultiple(keys: string[]): Promise<void>;
}
