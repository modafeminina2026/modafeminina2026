import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH  = 12 // 96-bit IV recommended for GCM
const TAG_LENGTH = 16 // 128-bit auth tag

function getKey(): Buffer {
  const config = useRuntimeConfig()
  const hex = config.encryptionKey as string
  if (!hex || hex.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes)')
  }
  return Buffer.from(hex, 'hex')
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Returns a base64 string: iv(12) + tag(16) + ciphertext
 */
export function encryptData(plaintext: string): string {
  const key = getKey()
  const iv  = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ])
  const tag = cipher.getAuthTag()

  // Pack: iv | tag | ciphertext → base64
  return Buffer.concat([iv, tag, encrypted]).toString('base64')
}

/**
 * Decrypts a base64 string produced by encryptData().
 */
export function decryptData(encoded: string): string {
  const key  = getKey()
  const data = Buffer.from(encoded, 'base64')

  const iv         = data.subarray(0, IV_LENGTH)
  const tag        = data.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH)
  const ciphertext = data.subarray(IV_LENGTH + TAG_LENGTH)

  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)

  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString('utf8')
}
