const Redis = require('ioredis')

// Read URL from env or fall back to localhost
const redisUrl = process.env.REDIS_URL || process.env.REDIS || 'redis://127.0.0.1:6379'

let client
try {
  client = new Redis(redisUrl)
  client.on('connect', () => console.log('Redis client connecting...'))
  client.on('ready', () => console.log('Redis ready'))
  client.on('error', (err) => console.warn('Redis error:', err.message || err))
  client.on('close', () => console.log('Redis connection closed'))
} catch (e) {
  console.warn('Failed to create Redis client:', e.message || e)
  client = null
}

// --- INTERNAL HELPER (DRY Fix) ---
/**
 * Wraps any Redis operation with safety checks and error handling.
 * @param {string} action - Name of the action for logging (e.g., 'GET')
 * @param {Function} operation - The async function to run
 */
const safeExecute = async (action, operation) => {
  if (!client) return null
  try {
    return await operation(client)
  } catch (e) {
    console.warn(`Redis ${action} failed:`, e.message || e)
    return null
  }
}

// --- EXPORTED METHODS ---

const getJson = async (key) => {
  return safeExecute('GET', async (c) => {
    const val = await c.get(key)
    return val ? JSON.parse(val) : null
  })
}

const setJson = async (key, obj, ttlSeconds = 30) => {
  return safeExecute('SET', async (c) => {
    const val = JSON.stringify(obj)
    if (ttlSeconds > 0) await c.set(key, val, 'EX', ttlSeconds)
    else await c.set(key, val)
  })
}

const del = async (key) => {
  return safeExecute('DEL', (c) => c.del(key))
}

module.exports = { client, getJson, setJson, del }