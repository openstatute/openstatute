const fetch = require('node-fetch');
const NanoCache = require('nano-cache');

const cache = new NanoCache({
  ttl: 60 * 60 * 1000, // max aged for cache entry: 1 hour
  limit: 5, // max hits for a cache entry
  bytes: 100 * NanoCache.SIZE.MB, // max memory use for data
});

const cachedTextFetch = url =>
  Promise.resolve()
    .then(() => {
      const inCacheVal = cache.get(url);
      if (inCacheVal) { return inCacheVal; }
      return fetch(url)
        .then(res => res.text())
        .then((text) => {
          cache.set(url, text);
          return text;
        });
    });

module.exports = cachedTextFetch;
