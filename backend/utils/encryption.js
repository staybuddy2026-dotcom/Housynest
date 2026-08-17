import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // Must be 256 bits (32 bytes)
const ALGORITHM = 'aes-256-cbc';

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
    console.warn('WARNING: ENCRYPTION_KEY is not set or not 64 hex characters (32 bytes) long. Bank details encryption might fail.');
}

/**
 * Encrypts a given text using AES-256-CBC.
 * @param {string} text - The plain text to encrypt.
 * @returns {{ encryptedData: string, iv: string } | null} The encrypted hex string and the initialization vector used.
 */
export const encryptSymmetric = (text) => {
    if (!text) return null;
    try {
        const key = Buffer.from(ENCRYPTION_KEY, 'hex');
        const iv = crypto.randomBytes(16); // 16 bytes for AES
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return {
            encryptedData: encrypted,
            iv: iv.toString('hex')
        };
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Encryption failed');
    }
};

/**
 * Decrypts a given text using AES-256-CBC.
 * @param {string} encryptedHex - The encrypted hex string.
 * @param {string} ivHex - The initialization vector used during encryption.
 * @returns {string | null} The decrypted plain text.
 */
export const decryptSymmetric = (encryptedHex, ivHex) => {
    if (!encryptedHex || !ivHex) return null;
    try {
        const key = Buffer.from(ENCRYPTION_KEY, 'hex');
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Decryption failed');
    }
};
