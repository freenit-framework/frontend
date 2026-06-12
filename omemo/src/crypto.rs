use aes_gcm::{
    Aes128Gcm, Key as AesGcmKey, Nonce as AesGcmNonce,
    aead::{Aead, KeyInit},
};

const AES_KEY_LEN: usize = 16;
const TAG_LEN: usize = 16;
const IV_LEN: usize = 12;

/// AES-128-GCM payload encryption used by OMEMO v0 / Conversations.
///
/// `key` is the 16-byte AES key.  Returns the ciphertext (without tag) and the
/// 16-byte authentication tag separately.
pub fn encrypt_message(
    plaintext: &[u8],
    iv: &[u8],
    key: &[u8],
) -> Result<(Vec<u8>, [u8; TAG_LEN]), String> {
    if iv.len() != IV_LEN {
        return Err(format!("invalid iv length: {}", iv.len()));
    }
    if key.len() != AES_KEY_LEN {
        return Err(format!("invalid key length: {}", key.len()));
    }

    let aes_key = AesGcmKey::<Aes128Gcm>::from_slice(key);
    let cipher = Aes128Gcm::new(aes_key);
    let nonce = AesGcmNonce::from_slice(iv);

    let ct_with_tag = cipher
        .encrypt(nonce, plaintext)
        .map_err(|e| format!("AES-GCM encryption failed: {e}"))?;

    let ct_len = ct_with_tag.len() - TAG_LEN;
    let mut ct = vec![0u8; ct_len];
    ct.copy_from_slice(&ct_with_tag[..ct_len]);

    let mut tag = [0u8; TAG_LEN];
    tag.copy_from_slice(&ct_with_tag[ct_len..]);

    Ok((ct, tag))
}

/// AES-128-GCM payload decryption used by OMEMO v0 / Conversations.
///
/// `key` is 32 bytes: the first 16 bytes are the AES key, the last 16 bytes are
/// the expected authentication tag.
pub fn decrypt_message(ciphertext: &[u8], iv: &[u8], key: &[u8]) -> Result<Vec<u8>, String> {
    if iv.len() != IV_LEN {
        return Err(format!("invalid iv length: {}", iv.len()));
    }
    if key.len() != AES_KEY_LEN + TAG_LEN {
        return Err(format!("invalid key length: {}", key.len()));
    }

    let mut ct = Vec::with_capacity(ciphertext.len() + TAG_LEN);
    ct.extend_from_slice(ciphertext);
    ct.extend_from_slice(&key[AES_KEY_LEN..AES_KEY_LEN + TAG_LEN]);

    let aes_key = AesGcmKey::<Aes128Gcm>::from_slice(&key[..AES_KEY_LEN]);
    let cipher = Aes128Gcm::new(aes_key);
    let nonce = AesGcmNonce::from_slice(iv);

    cipher
        .decrypt(nonce, ct.as_ref())
        .map_err(|e| format!("AES-GCM decryption failed: {e}"))
}
