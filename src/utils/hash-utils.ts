import CryptoJS from 'crypto-js'
import { HashAlgorithm } from '../types/types'

/*
 * Hash Algorithm map to reduce switch statement redundancy
 */
const HASH_ALGORITHMS = {
  SHA1: CryptoJS.SHA1,
  SHA3: CryptoJS.SHA3,
  SHA224: CryptoJS.SHA224,
  SHA256: CryptoJS.SHA256,
  SHA384: CryptoJS.SHA384,
  SHA512: CryptoJS.SHA512,
  MD5: CryptoJS.MD5,
  RIPEMD160: CryptoJS.RIPEMD160,
} as const

const HEX_REGEX = /^[0-9a-f]+$/i

/*
 * Unified hash processing function
 */
export function hashMethodology(
  data: string,
  hashAlgorithm?: HashAlgorithm,
): string {
  if (!hashAlgorithm) {
    throw new Error(`KyselyHashPlugin: Algorithm required.`)
  }

  if (!Object.keys(HASH_ALGORITHMS).includes(hashAlgorithm)) {
    throw new Error(`KyselyHashPlugin: Algorithm not recognized.`)
  }

  return HASH_ALGORITHMS[hashAlgorithm](data).toString()
}
