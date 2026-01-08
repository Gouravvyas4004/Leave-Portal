const Redis = require('ioredis')

// Read URL from env or fall back to localhost. Accepts standard Redis URL or host/port.
const redisUrl = process.env.REDIS_URL || process.env.REDIS || 'redis://127.0.0.1:6379'

let client
try{
  client = new Redis(redisUrl)
  client.on('connect', () => console.log('Redis client connecting...'))
  client.on('ready', () => console.log('Redis ready'))
  client.on('error', (err) => console.warn('Redis error:', err && err.message ? err.message : err))
  client.on('close', () => console.log('Redis connection closed'))
} catch(e){
  console.warn('Failed to create Redis client:', e && e.message ? e.message : e)
  client = null
}

const safeGet = async (key) => {
  if (!client) return null
  try{
    const v = await client.get(key)
    return v
  }catch(e){
    console.warn('Redis GET failed:', e && e.message ? e.message : e)
    return null
  }
}

const safeSet = async (key, obj, ttlSeconds = 30) => {
  if (!client) return
  try{
    const val = typeof obj === 'string' ? obj : JSON.stringify(obj)
    if (ttlSeconds > 0) await client.set(key, val, 'EX', ttlSeconds)
    else await client.set(key, val)
  }catch(e){
    console.warn('Redis SET failed:', e && e.message ? e.message : e)
  }
}

const safeDel = async (key) => {
  if (!client) return
  try{
    await client.del(key)
  }catch(e){
    console.warn('Redis DEL failed:', e && e.message ? e.message : e)
  }
}

const getJson = async (key) => {
  const v = await safeGet(key)
  if (!v) return null
  try{ return JSON.parse(v) }catch(e){ return null }
}

module.exports = { client, getJson, setJson: safeSet, del: safeDel }
