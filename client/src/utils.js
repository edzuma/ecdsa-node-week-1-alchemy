import { bytesToHex, hexToBytes } from "ethereum-cryptography/utils"
import { utils } from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";
import { getPublicKey } from "ethereum-cryptography/secp256k1"

export function createPrivateKey() {
    const pKeyByte = utils.randomPrivateKey();
    const hex = bytesToHex(pKeyByte);
    console.log(hex);
    return hex;
}

export function extractAddress(privateKey) {
    const pbKeyByte = getPublicKey(hexToBytes(privateKey));
    const hash = keccak256(pbKeyByte.slice(1)).slice(-20);
    const address = '0x'+ bytesToHex(hash);
    return address;
}

async function deriveKey(password, salt) {
    const encoder = new TextEncoder();

    // Convert password to a key
    const passwordKey = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        "PBKDF2",
        false,
        ["deriveBits", "deriveKey"]
    );

    // Derive a key using PBKDF2
    const key = await crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt, // A unique salt for deriving the key
            iterations: 500000, // Iterations for strength
            hash: "SHA-256", // Hash algorithm
        },
        passwordKey,
        { name: "AES-GCM", length: 256 }, // Key for AES-GCM
        false, // Non-exportable key
        ["encrypt", "decrypt"]
    );

    return key;
}

export async function encryptWithPassword(password, data) {
    const salt = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt);
    const iv = crypto.getRandomValues(new Uint8Array(12)); // Random IV
    const encoder = new TextEncoder();

    const encryptedData = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        encoder.encode(data)
    );

    return { encryptedData: bytesToHex(new Uint8Array(encryptedData)), iv: bytesToHex(iv), salt: bytesToHex(salt) };
}

export async function decryptWithPassword(password, iv, salt, encryptedData) {

    const key = await deriveKey(password, hexToBytes(salt));

    const decryptedData = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: hexToBytes(iv) },
        key,
        hexToBytes(encryptedData)
    );

    return new TextDecoder().decode(decryptedData);
}


export function openDB() {
    const req = window.indexedDB.open('MetaData');
    return new Promise((resolve, reject) => {
        req.onupgradeneeded = () => {
            if (req.result.objectStoreNames.contains("store")) return;
            req.result.createObjectStore("store", { autoIncrement: true });
        }
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

export function saveMetaData(metaData) {
    return new Promise(async (resolve, reject) => {
        let db;
        try {
            db = await openDB();
        } catch (error) {
            reject(error)
        }
        const transaction = db.transaction("store", "readwrite");
        transaction.objectStore("store").add(metaData);
        transaction.onerror = () => reject(transaction.error);
        transaction.oncomplete = () => resolve(true);
    });
}

export function getAllMetaData() {
    return new Promise(async (resolve, reject) => {
        let db;
        try {
            db = await openDB();
        } catch (error) {
            reject(error)
        }
        const transaction = db.transaction("store", "readonly");
        const store = transaction.objectStore("store");
        const req = store.getAll();
        req.onerror = () => reject(req.error);
        req.onsuccess = async () => {
            const metaData = req.result;
            return resolve(metaData);
        };
    });
}

