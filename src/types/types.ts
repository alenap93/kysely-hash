export type HashAlgorithm =
  | 'MD5'
  | 'SHA1'
  | 'SHA256'
  | 'SHA224'
  | 'SHA512'
  | 'SHA384'
  | 'SHA3'
  | 'RIPEMD160'

type NestedKeys<T> = {
  [K in keyof T]: keyof T[K]
}[keyof T]

export type NestedKeysOrString<T> = NestedKeys<T> | (string & {})

export type HashOptions<T> = {
  /**
   * field to hash during insert and update, or in '=' and '!=' where condition (use alias if it is used)
   */
  fieldsToHash: NestedKeysOrString<T>[]
  /**
   * hash algorithm
   */
  hashAlgorithm?: HashAlgorithm
}
