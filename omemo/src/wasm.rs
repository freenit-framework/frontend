use wasm_bindgen::prelude::*;

use rand::{SeedableRng, rngs::StdRng};
use serde::{Deserialize, Serialize};
use wa_rs_libsignal::core::{DeviceId, ProtocolAddress};
use wa_rs_libsignal::protocol::{
    CiphertextMessageType, GenericSignedPreKey, IdentityKey, PreKeyBundle, PreKeyId,
    PreKeySignalMessage, PublicKey, SignalMessage, SignalProtocolError, SignedPreKeyId,
    UsePQRatchet,
};
use wa_rs_libsignal::protocol::{
    message_encrypt, message_decrypt_prekey, message_decrypt_signal, process_prekey_bundle,
};

use crate::crypto::{decrypt_message as aes_decrypt, encrypt_message as aes_encrypt};

use crate::store::{
    OmemoIdentityStore, OmemoPreKeyStore, OmemoSessionStore, OmemoSignedPreKeyStore, StoreRef,
    StoreState,
};

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct OmemoPreKeyInput {
    pub id: u32,
    pub public_key: Vec<u8>,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct OmemoBundleInput {
    pub device_id: u32,
    pub identity_key: Vec<u8>,
    pub signed_pre_key_id: u32,
    pub signed_pre_key_public: Vec<u8>,
    pub signed_pre_key_signature: Vec<u8>,
    pub pre_keys: Vec<OmemoPreKeyInput>,
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct EncryptedKeyResult {
    pub pre_key: bool,
    pub value: Vec<u8>,
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct EncryptedMessageResult {
    pub ciphertext: Vec<u8>,
    pub tag: Vec<u8>,
}

fn js_err<E: std::fmt::Display>(e: E) -> JsValue {
    JsValue::from_str(&e.to_string())
}

#[wasm_bindgen]
pub struct OmemoCrypto {
    store: StoreRef,
}

#[wasm_bindgen]
impl OmemoCrypto {
    #[wasm_bindgen(constructor)]
    pub fn new(device_id: u32) -> Self {
        Self {
            store: StoreRef::new(StoreState::generate(device_id)),
        }
    }

    /// Load a previously serialized store.
    #[wasm_bindgen]
    pub fn load(device_id: u32, data: &[u8]) -> Result<OmemoCrypto, JsValue> {
        let state = StoreState::deserialize(data).map_err(js_err)?;
        // If the caller passed a non-zero device id, ensure it matches the stored one.
        if device_id != 0 && state.device_id != device_id {
            return Err(JsValue::from_str("device id mismatch"));
        }
        Ok(Self {
            store: StoreRef::new(state),
        })
    }

    #[wasm_bindgen(getter)]
    pub fn device_id(&self) -> u32 {
        self.store.0.borrow().device_id
    }

    #[wasm_bindgen]
    pub fn serialize(&self) -> Result<Vec<u8>, JsValue> {
        self.store.0.borrow().serialize().map_err(js_err)
    }

    #[wasm_bindgen]
    pub fn refill_prekeys(&mut self) {
        self.store.0.borrow_mut().refill_prekeys();
    }

    #[wasm_bindgen]
    pub fn rotate_signed_prekey(&mut self) {
        self.store.0.borrow_mut().rotate_signed_prekey();
    }

    /// Returns the local OMEMO bundle as a plain JS object.
    #[wasm_bindgen]
    pub fn bundle(&self) -> Result<JsValue, JsValue> {
        let state = self.store.0.borrow();
        let identity_key = state.identity_key_pair.identity_key().serialize().to_vec();
        let signed_pre_key_id = u32::from(state.signed_prekey.id().map_err(js_err)?);
        let signed_pre_key_public = state
            .signed_prekey
            .public_key()
            .map_err(js_err)?
            .serialize()
            .to_vec();
        let signed_pre_key_signature = state.signed_prekey.signature().map_err(js_err)?.to_vec();

        let mut pre_keys: Vec<OmemoPreKeyInput> = Vec::with_capacity(state.prekeys.len());
        for (id, rec) in &state.prekeys {
            pre_keys.push(OmemoPreKeyInput {
                id: u32::from(*id),
                public_key: rec.public_key().map_err(js_err)?.serialize().to_vec(),
            });
        }
        pre_keys.sort_by_key(|k| k.id);

        let bundle = OmemoBundleInput {
            device_id: state.device_id,
            identity_key,
            signed_pre_key_id,
            signed_pre_key_public,
            signed_pre_key_signature,
            pre_keys,
        };
        serde_wasm_bindgen::to_value(&bundle).map_err(js_err)
    }

    /// Encrypt a 32-byte payload key for a recipient device.  If no session exists
    /// yet, `bundle` must contain the recipient's OMEMO bundle.
    #[wasm_bindgen]
    pub async fn encrypt_key(
        &mut self,
        jid: String,
        device_id: u32,
        bundle_js: JsValue,
        key: Vec<u8>,
    ) -> Result<JsValue, JsValue> {
        let address = ProtocolAddress::new(jid, DeviceId::from(device_id));
        let bundle: Option<OmemoBundleInput> = if bundle_js.is_null() || bundle_js.is_undefined() {
            None
        } else {
            Some(serde_wasm_bindgen::from_value(bundle_js).map_err(js_err)?)
        };

        let mut bundle_opt = bundle.as_ref();
        loop {
            let mut session_store = OmemoSessionStore(self.store.clone());
            let mut identity_store = OmemoIdentityStore(self.store.clone());

            match message_encrypt(&key, &address, &mut session_store, &mut identity_store).await {
                Ok(ct) => {
                    let result = EncryptedKeyResult {
                        pre_key: matches!(
                            ct.message_type(),
                            CiphertextMessageType::PreKey
                        ),
                        value: ct.serialize().to_vec(),
                    };
                    return serde_wasm_bindgen::to_value(&result).map_err(js_err);
                }
                Err(SignalProtocolError::SessionNotFound(_)) => {
                    let bundle_input = bundle_opt
                        .ok_or_else(|| JsValue::from_str("no session and no bundle provided"))?;
                    bundle_opt = None;
                    let prekey_bundle = build_prekey_bundle(bundle_input)?;
                    let mut rng = StdRng::from_os_rng();
                    process_prekey_bundle(
                        &address,
                        &mut session_store,
                        &mut identity_store,
                        &prekey_bundle,
                        &mut rng,
                        UsePQRatchet::No,
                    )
                    .await
                    .map_err(js_err)?;
                    // Loop retries message_encrypt with the freshly created session.
                }
                Err(e) => return Err(js_err(e)),
            }
        }
    }

    /// Decrypt a key slot.  `is_prekey` is the hint from the incoming OMEMO header;
    /// the actual message type is determined from the serialized bytes.
    #[wasm_bindgen]
    pub async fn decrypt_key(
        &mut self,
        jid: String,
        device_id: u32,
        _is_prekey: bool,
        value: Vec<u8>,
    ) -> Result<Vec<u8>, JsValue> {
        let address = ProtocolAddress::new(jid, DeviceId::from(device_id));
        if value.is_empty() {
            return Err(JsValue::from_str("empty key message"));
        }
        let msg_type = value[0] & 0x0F;

        let mut session_store = OmemoSessionStore(self.store.clone());
        let mut identity_store = OmemoIdentityStore(self.store.clone());
        let mut rng = StdRng::from_os_rng();

        if msg_type == 3 {
            let msg = PreKeySignalMessage::try_from(value.as_slice()).map_err(js_err)?;
            let mut prekey_store = OmemoPreKeyStore(self.store.clone());
            let mut signed_prekey_store = OmemoSignedPreKeyStore(self.store.clone());
            message_decrypt_prekey(
                &msg,
                &address,
                &mut session_store,
                &mut identity_store,
                &mut prekey_store,
                &mut signed_prekey_store,
                &mut rng,
                UsePQRatchet::No,
            )
            .await
            .map_err(js_err)
        } else if msg_type == 2 {
            let msg = SignalMessage::try_from(value.as_slice()).map_err(js_err)?;
            message_decrypt_signal(
                &msg,
                &address,
                &mut session_store,
                &mut identity_store,
                &mut rng,
            )
            .await
            .map_err(js_err)
        } else {
            Err(JsValue::from_str(&format!(
                "unknown ciphertext message type: {}",
                msg_type
            )))
        }
    }

    #[wasm_bindgen]
    pub fn encrypt_message(
        &mut self,
        plaintext: Vec<u8>,
        iv: Vec<u8>,
        key: Vec<u8>,
    ) -> Result<JsValue, JsValue> {
        let (ct, tag) = aes_encrypt(&plaintext, &iv, &key).map_err(js_err)?;
        serde_wasm_bindgen::to_value(&EncryptedMessageResult {
            ciphertext: ct,
            tag: tag.to_vec(),
        })
        .map_err(js_err)
    }

    #[wasm_bindgen]
    pub fn decrypt_message(
        &mut self,
        ciphertext: Vec<u8>,
        iv: Vec<u8>,
        key: Vec<u8>,
    ) -> Result<Vec<u8>, JsValue> {
        aes_decrypt(&ciphertext, &iv, &key).map_err(js_err)
    }
}

fn build_prekey_bundle(input: &OmemoBundleInput) -> Result<PreKeyBundle, JsValue> {
    let identity_key = IdentityKey::try_from(input.identity_key.as_slice()).map_err(js_err)?;
    let signed_prekey_public =
        PublicKey::try_from(input.signed_pre_key_public.as_slice()).map_err(js_err)?;

    let prekey = input
        .pre_keys
        .first()
        .ok_or_else(|| JsValue::from_str("bundle has no prekeys"))?;
    let prekey_public = PublicKey::try_from(prekey.public_key.as_slice()).map_err(js_err)?;

    PreKeyBundle::new(
        input.device_id,
        DeviceId::from(input.device_id),
        Some((PreKeyId::from(prekey.id), prekey_public)),
        SignedPreKeyId::from(input.signed_pre_key_id),
        signed_prekey_public,
        input.signed_pre_key_signature.clone(),
        identity_key,
    )
    .map_err(js_err)
}
