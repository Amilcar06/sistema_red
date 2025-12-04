import Redis from 'ioredis';
import redisConfig from '../config/redis';

class CacheService {
  private redis: Redis;

  constructor() {
    // En tests, usar mock o desactivar caché
    if (process.env.NODE_ENV === 'test') {
      this.redis = null as any;
      return;
    }

    try {
      this.redis = new Redis(redisConfig);
      
      this.redis.on('error', (err) => {
        console.error('Redis error:', err);
      });

      this.redis.on('connect', () => {
        console.log('Redis connected');
      });
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      // En caso de error, seguir sin caché
      this.redis = null as any;
    }
  }

  /**
   * Obtiene un valor del caché
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) return null;

    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error getting cache key ${key}:`, error);
      return null;
    }
  }

  /**
   * Guarda un valor en el caché
   */
  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    if (!this.redis) return;

    try {
      await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting cache key ${key}:`, error);
    }
  }

  /**
   * Elimina una clave del caché
   */
  async delete(key: string): Promise<void> {
    if (!this.redis) return;

    try {
      await this.redis.del(key);
    } catch (error) {
      console.error(`Error deleting cache key ${key}:`, error);
    }
  }

  /**
   * Elimina todas las claves que coincidan con un patrón
   */
  async deletePattern(pattern: string): Promise<void> {
    if (!this.redis) return;

    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error(`Error deleting cache pattern ${pattern}:`, error);
    }
  }

  /**
   * Verifica si Redis está disponible
   */
  isAvailable(): boolean {
    return this.redis !== null && this.redis.status === 'ready';
  }
}

export default new CacheService();

