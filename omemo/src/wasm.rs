use wasm_bindgen::prelude::*;

use dziber_omemo::bundle::{add_signal_prefix, strip_signal_prefix, Bundle};
use dziber_omemo::crypto::{
    decrypt_payload_v0_conversations, encrypt_payload_v0_conversations,
};
use dziber_omemo::manager::OmemoManager;
use dziber_omemo::signal_ratchet::proto::PreKeySignalMessage;
use dziber_omemo::signal_ratchet::{IdentityKeyPair, KeyPair, Session};
use serde::{Deserialize, Serialize};

use crate::store::{StoreData, WasmStore};

const PREKEY_TARGET: usize = 100;
const PREKEY_THRESHOLD: usize = 50;

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
pub struct EncryptedPayloadResult {
    pub ciphertext: Vec<u8>,
    pub key: Vec<u8>,
    pub auth_tag: Vec<u8>,
    pub iv: Vec<u8>,
}

fn js_err<E: std::fmt::Display>(e: E) -> JsValue {
    JsValue::from_str(&e.to_string())
}

#[wasm_bindgen]
pub struct OmemoCrypto {
    mgr: OmemoManager,
    store: WasmStore,
}

#[wasm_bindgen]
impl OmemoCrypto {
    #[wasm_bindgen(constructor)]
    pub fn new(device_id: u32) -> Self {
        let store = WasmStore::new(StoreData::default());
        let mgr = OmemoManager::load_or_generate(device_id, Box::new(store.clone()));
        Self { mgr, store }
    }

    /// Load a previously serialized store.
    #[wasm_bindgen]
    pub fn load(device_id: u32, data: &[u8]) -> Result<OmemoCrypto, JsValue> {
        let store_data = WasmStore::deserialize(data).map_err(js_err)?;
        let store = WasmStore::new(store_data);
        let mgr = OmemoManager::load_or_generate(device_id, Box::new(store.clone()));
        Ok(Self { mgr, store })
    }

    #[wasm_bindgen(getter)]
    pub fn device_id(&self) -> u32 {
        self.mgr.our_device_id()
    }

    #[wasm_bindgen]
    pub fn serialize(&self) -> Result<Vec<u8>, JsValue> {
        self.mgr.save().map_err(js_err)?;
        self.store.serialize().map_err(js_err)
    }

    #[wasm_bindgen]
    pub fn refill_prekeys(&mut self) {
        let current = self.mgr.account.all_stored_one_time_keys().len();
        if current < PREKEY_THRESHOLD {
            let need = PREKEY_TARGET - current;
            self.mgr.account.inner.generate_one_time_keys(need);
        }
    }

    #[wasm_bindgen]
    pub fn rotate_signed_prekey(&mut self) {
        self.mgr.account.inner.generate_fallback_key();
    }

    /// Returns the local OMEMO bundle as a plain JS object.
    #[wasm_bindgen]
    pub fn bundle(&mut self) -> Result<JsValue, JsValue> {
        let bundle = self
            .mgr
            .self_bundle()
            .or_else(|| {
                self.mgr.account.inner.generate_one_time_keys(PREKEY_TARGET);
                self.mgr.self_bundle()
            })
            .ok_or_else(|| JsValue::from_str("no OMEMO bundle available"))?;

        let mut pre_keys = Vec::with_capacity(bundle.prekeys.len());
        for (id, pk) in &bundle.prekeys {
            pre_keys.push(OmemoPreKeyInput {
                id: *id,
                public_key: add_signal_prefix(pk),
            });
        }
        pre_keys.sort_by_key(|k| k.id);

        let bundle_out = OmemoBundleInput {
            device_id: bundle.device_id,
            identity_key: add_signal_prefix(&bundle.ik),
            signed_pre_key_id: bundle.spk_id,
            signed_pre_key_public: add_signal_prefix(&bundle.spk),
            signed_pre_key_signature: bundle.spks,
            pre_keys,
        };

        serde_wasm_bindgen::to_value(&bundle_out).map_err(js_err)
    }

    /// Encrypt a 32-byte payload key for a recipient device.  If no session exists
    /// yet, `bundle` must contain the recipient's OMEMO bundle.
    #[wasm_bindgen]
    pub fn encrypt_key(
        &mut self,
        jid: String,
        device_id: u32,
        bundle_js: JsValue,
        key: Vec<u8>,
    ) -> Result<JsValue, JsValue> {
        let sessions = self.mgr.legacy_sessions.entry(jid.clone()).or_default();

        if sessions.get(&device_id).is_none() {
            let bundle: OmemoBundleInput = if bundle_js.is_null() || bundle_js.is_undefined() {
                return Err(JsValue::from_str("no session and no bundle provided"));
            } else {
                serde_wasm_bindgen::from_value(bundle_js).map_err(js_err)?
            };
            let bundle = build_bundle(&bundle)?;
            if !self.mgr.create_session_from_bundle(&jid, device_id, &bundle) {
                return Err(JsValue::from_str("failed to create session from bundle"));
            }
        }

        let sessions = self.mgr.legacy_sessions.get_mut(&jid).unwrap();
        let session = sessions
            .get_mut(&device_id)
            .ok_or_else(|| JsValue::from_str("session not found after creation"))?;

        let ct = session.encrypt(&key, &mut rand::thread_rng()).map_err(js_err)?;
        let result = EncryptedKeyResult {
            pre_key: ct.is_prekey(),
            value: ct.into_bytes(),
        };
        serde_wasm_bindgen::to_value(&result).map_err(js_err)
    }

    /// Decrypt a key slot.  `is_prekey` is the hint from the incoming OMEMO header.
    #[wasm_bindgen]
    pub fn decrypt_key(
        &mut self,
        jid: String,
        device_id: u32,
        _is_prekey: bool,
        value: Vec<u8>,
    ) -> Result<Vec<u8>, JsValue> {
        if value.is_empty() {
            return Err(JsValue::from_str("empty key message"));
        }
        let msg_type = value[0] & 0x0F;

        if msg_type == 3 {
            let prekey_message =
                PreKeySignalMessage::decode(&value[1..]).map_err(js_err)?;

            let identity_secret = self.mgr.account.identity_secret_key_bytes();
            let signed_prekey_secret = self
                .mgr
                .account
                .fallback_secret_key_by_id(prekey_message.signed_pre_key_id)
                .ok_or_else(|| JsValue::from_str("signed prekey not found"))?;
            let one_time_secret = self
                .mgr
                .account
                .one_time_secret_key(prekey_message.pre_key_id)
                .ok_or_else(|| JsValue::from_str("one-time prekey not found"))?;

            let identity = IdentityKeyPair::from_secret(identity_secret);
            let signed_prekey = KeyPair::from_secret(signed_prekey_secret);
            let one_time = KeyPair::from_secret(one_time_secret);

            let (session, plaintext, _used_prekey_id) =
                Session::new_bob(&identity, &signed_prekey, &one_time, &value).map_err(js_err)?;

            self.mgr
                .legacy_sessions
                .entry(jid)
                .or_default()
                .insert(device_id, session);

            Ok(plaintext)
        } else if msg_type == 2 {
            let sessions = self
                .mgr
                .legacy_sessions
                .get_mut(&jid)
                .ok_or_else(|| JsValue::from_str("no session for sender"))?;
            let session = sessions
                .get_mut(&device_id)
                .ok_or_else(|| JsValue::from_str("no session for sender device"))?;
            session.decrypt(&value, false).map_err(js_err)
        } else {
            Err(JsValue::from_str(&format!(
                "unknown ciphertext message type: {}",
                msg_type
            )))
        }
    }

    #[wasm_bindgen]
    pub fn encrypt_payload(&self, plaintext: Vec<u8>) -> Result<JsValue, JsValue> {
        let (ciphertext, key, auth_tag, iv) = encrypt_payload_v0_conversations(&plaintext);
        serde_wasm_bindgen::to_value(&EncryptedPayloadResult {
            ciphertext,
            key: key.to_vec(),
            auth_tag: auth_tag.to_vec(),
            iv: iv.to_vec(),
        })
        .map_err(js_err)
    }

    #[wasm_bindgen]
    pub fn decrypt_payload(
        &self,
        ciphertext: Vec<u8>,
        iv: Vec<u8>,
        key_and_tag: Vec<u8>,
    ) -> Result<Vec<u8>, JsValue> {
        if key_and_tag.len() != 32 {
            return Err(JsValue::from_str("invalid payload key length"));
        }
        let key: [u8; 16] = key_and_tag
            .get(..16)
            .expect("payload key length checked")
            .try_into()
            .map_err(js_err)?;
        let auth_tag: [u8; 16] = key_and_tag
            .get(16..32)
            .expect("payload key length checked")
            .try_into()
            .map_err(js_err)?;
        let iv: [u8; 12] = iv
            .as_slice()
            .try_into()
            .map_err(|_| JsValue::from_str("invalid payload IV length"))?;

        decrypt_payload_v0_conversations(&ciphertext, &key, &auth_tag, &iv)
            .ok_or_else(|| JsValue::from_str("OMEMO payload authentication failed"))
    }
}

fn build_bundle(input: &OmemoBundleInput) -> Result<Bundle, JsValue> {
    let mut prekeys = Vec::with_capacity(input.pre_keys.len());
    for pk in &input.pre_keys {
        prekeys.push((pk.id, strip_signal_prefix(pk.public_key.clone())));
    }
    prekeys.sort_by_key(|(id, _)| *id);

    Ok(Bundle {
        device_id: input.device_id,
        spk_id: input.signed_pre_key_id,
        spk: strip_signal_prefix(input.signed_pre_key_public.clone()),
        spks: input.signed_pre_key_signature.clone(),
        ik: strip_signal_prefix(input.identity_key.clone()),
        prekeys,
    })
}
