/**
 * Base58 encoding – compatible with Solana / Bitcoin alphabet.
 * No external dependency required.
 */

const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const BASE = ALPHABET.length; // 58

export function base58Encode(bytes: Uint8Array): string {
    // Count leading zeros
    let zeroes = 0;
    for (let i = 0; i < bytes.length && bytes[i] === 0; i++) {
        zeroes++;
    }

    // Convert byte array to a big number, then repeatedly mod 58
    const size = Math.ceil(bytes.length * 138 / 100) + 1; // log(256) / log(58) ≈ 1.366
    const b58 = new Uint8Array(size);
    let length = 0;

    for (let i = zeroes; i < bytes.length; i++) {
        let carry = bytes[i];
        let j = 0;
        for (let k = size - 1; (carry !== 0 || j < length) && k >= 0; k--, j++) {
            carry += 256 * b58[k];
            b58[k] = carry % BASE;
            carry = Math.floor(carry / BASE);
        }
        length = j;
    }

    // Skip leading zeroes in b58 result
    let start = size - length;
    while (start < size && b58[start] === 0) {
        start++;
    }

    // Build the output string
    let str = ALPHABET[0].repeat(zeroes);
    for (let i = start; i < size; i++) {
        str += ALPHABET[b58[i]];
    }

    return str;
}
