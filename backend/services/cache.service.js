const NodeCache = require('node-cache');

class CacheService {
  constructor() {
    this.cache = new NodeCache({ stdTTL: 300, checkperiod: 60 }); // Default TTL 5 minutes, check every 60 seconds
  }

  get(key) {
    return this.cache.get(key);
  }

  set(key, value, ttl) {
    return this.cache.set(key, value, ttl ?? 0);
  }

  del(keys) {
    return this.cache.del(keys);
  }

  flush() {
    this.cache.flushAll();
  }
}

module.exports = new CacheService();
