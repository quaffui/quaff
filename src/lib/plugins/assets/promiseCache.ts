export async function getOrCreateCachedValue<Key, Value>(
  cache: {
    get(key: Key): Promise<Value> | undefined;
    set(key: Key, value: Promise<Value>): unknown;
    delete(key: Key): boolean;
  },
  key: Key,
  createValue: () => Promise<Value>
): Promise<Value> {
  const cached = cache.get(key);

  if (cached) {
    return cached;
  }

  const pending = createValue();
  cache.set(key, pending);

  try {
    return await pending;
  } catch (error) {
    if (cache.get(key) === pending) {
      cache.delete(key);
    }

    throw error;
  }
}
