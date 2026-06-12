use std::cell::RefCell;
use std::collections::HashMap;
use std::rc::Rc;

use async_trait::async_trait;
use chrono::Utc;
use rand::{CryptoRng, Rng, SeedableRng, rngs::StdRng};
use serde::{Deserialize, Serialize};
use wa_rs_libsignal::core::{DeviceId, ProtocolAddress};
use wa_rs_libsignal::protocol::KeyPair;
use wa_rs_libsignal::protocol::{
    Direction, GenericSignedPreKey, IdentityChange, IdentityKey, IdentityKeyPair, IdentityKeyStore,
    PreKeyId, PreKeyRecord, PreKeyStore, SessionRecord, SessionStore, SignedPreKeyId,
    SignedPreKeyRecord, SignedPreKeyStore, SignalProtocolError, Timestamp,
};
use wa_rs_libsignal::protocol::error::Result as SignalResult;

const PREKEY_TARGET: usize = 100;
const PREKEY_THRESHOLD: usize = 50;

#[derive(Clone)]
pub struct StoreRef(pub Rc<RefCell<StoreState>>);

impl StoreRef {
    pub fn new(state: StoreState) -> Self {
        Self(Rc::new(RefCell::new(state)))
    }
}

pub struct StoreState {
    pub device_id: u32,
    pub identity_key_pair: IdentityKeyPair,
    pub registration_id: u32,
    pub signed_prekey: SignedPreKeyRecord,
    pub signed_prekeys: HashMap<SignedPreKeyId, SignedPreKeyRecord>,
    pub prekeys: HashMap<PreKeyId, PreKeyRecord>,
    pub sessions: HashMap<ProtocolAddress, SessionRecord>,
    pub trusted: HashMap<ProtocolAddress, IdentityKey>,
}

#[derive(Serialize, Deserialize)]
struct SerializedStore {
    version: u32,
    device_id: u32,
    identity_key_pair: Vec<u8>,
    registration_id: u32,
    signed_prekey_id: u32,
    signed_prekey: Vec<u8>,
    signed_prekeys: Vec<(u32, Vec<u8>)>,
    prekeys: Vec<(u32, Vec<u8>)>,
    sessions: Vec<(String, u32, Vec<u8>)>,
    trusted: Vec<(String, u32, Vec<u8>)>,
}

impl StoreState {
    pub fn generate(device_id: u32) -> Self {
        let mut rng = StdRng::from_os_rng();
        let identity_key_pair = IdentityKeyPair::generate(&mut rng);
        let registration_id = device_id;

        let signed_prekey = generate_signed_prekey(&identity_key_pair, 1, &mut rng);
        let mut signed_prekeys = HashMap::new();
        signed_prekeys.insert(SignedPreKeyId::from(1u32), signed_prekey.clone());

        let prekeys = generate_prekeys(1, PREKEY_TARGET as u32, &mut rng);

        Self {
            device_id,
            identity_key_pair,
            registration_id,
            signed_prekey,
            signed_prekeys,
            prekeys,
            sessions: HashMap::new(),
            trusted: HashMap::new(),
        }
    }

    pub fn serialize(&self) -> Result<Vec<u8>, String> {
        let mut signed_prekeys = Vec::with_capacity(self.signed_prekeys.len());
        for (id, rec) in &self.signed_prekeys {
            signed_prekeys.push((u32::from(*id), rec.serialize().map_err(|e| e.to_string())?));
        }

        let mut prekeys = Vec::with_capacity(self.prekeys.len());
        for (id, rec) in &self.prekeys {
            prekeys.push((u32::from(*id), rec.serialize().map_err(|e| e.to_string())?));
        }

        let mut sessions = Vec::with_capacity(self.sessions.len());
        for (addr, rec) in &self.sessions {
            sessions.push((
                addr.name().to_string(),
                u32::from(addr.device_id()),
                rec.serialize().map_err(|e| e.to_string())?,
            ));
        }

        let mut trusted = Vec::with_capacity(self.trusted.len());
        for (addr, key) in &self.trusted {
            trusted.push((
                addr.name().to_string(),
                u32::from(addr.device_id()),
                key.serialize().to_vec(),
            ));
        }

        let data = SerializedStore {
            version: 1,
            device_id: self.device_id,
            identity_key_pair: self.identity_key_pair.serialize().to_vec(),
            registration_id: self.registration_id,
            signed_prekey_id: u32::from(self.signed_prekey.id().map_err(|e| e.to_string())?),
            signed_prekey: self.signed_prekey.serialize().map_err(|e| e.to_string())?,
            signed_prekeys,
            prekeys,
            sessions,
            trusted,
        };

        bincode::serialize(&data).map_err(|e| e.to_string())
    }

    pub fn deserialize(bytes: &[u8]) -> Result<Self, String> {
        let data: SerializedStore = bincode::deserialize(bytes).map_err(|e| e.to_string())?;
        if data.version != 1 {
            return Err(format!("unsupported store version: {}", data.version));
        }

        let identity_key_pair = IdentityKeyPair::try_from(data.identity_key_pair.as_slice())
            .map_err(|e| format!("invalid identity key pair: {e}"))?;

        let signed_prekey = SignedPreKeyRecord::deserialize(&data.signed_prekey)
            .map_err(|e| format!("invalid signed prekey: {e}"))?;

        let mut signed_prekeys = HashMap::new();
        for (id, bytes) in data.signed_prekeys {
            let rec = SignedPreKeyRecord::deserialize(&bytes)
                .map_err(|e| format!("invalid signed prekey {}: {e}", id))?;
            signed_prekeys.insert(SignedPreKeyId::from(id), rec);
        }

        let mut prekeys = HashMap::new();
        for (id, bytes) in data.prekeys {
            let rec = PreKeyRecord::deserialize(&bytes)
                .map_err(|e| format!("invalid prekey {}: {e}", id))?;
            prekeys.insert(PreKeyId::from(id), rec);
        }

        let mut sessions = HashMap::new();
        for (name, device_id, bytes) in data.sessions {
            let rec = SessionRecord::deserialize(&bytes)
                .map_err(|e| format!("invalid session {}.{}: {e}", name, device_id))?;
            sessions.insert(ProtocolAddress::new(name, DeviceId::from(device_id)), rec);
        }

        let mut trusted = HashMap::new();
        for (name, device_id, bytes) in data.trusted {
            let key = IdentityKey::try_from(bytes.as_slice())
                .map_err(|e| format!("invalid identity {}.{}: {e}", name, device_id))?;
            trusted.insert(ProtocolAddress::new(name, DeviceId::from(device_id)), key);
        }

        Ok(Self {
            device_id: data.device_id,
            identity_key_pair,
            registration_id: data.registration_id,
            signed_prekey,
            signed_prekeys,
            prekeys,
            sessions,
            trusted,
        })
    }

    pub fn refill_prekeys(&mut self) {
        if self.prekeys.len() >= PREKEY_THRESHOLD {
            return;
        }
        let mut rng = StdRng::from_os_rng();
        let start = self
            .prekeys
            .keys()
            .map(|id| u32::from(*id))
            .max()
            .unwrap_or(0)
            .saturating_add(1);
        let need = PREKEY_TARGET - self.prekeys.len();
        let new = generate_prekeys(start, start + need as u32 - 1, &mut rng);
        self.prekeys.extend(new);
    }

    pub fn rotate_signed_prekey(&mut self) {
        let mut rng = StdRng::from_os_rng();
        let current_id = u32::from(
            self.signed_prekey
                .id()
                .unwrap_or(SignedPreKeyId::from(0u32)),
        );
        let new_id = current_id.wrapping_add(1).max(1);

        let new_prekey = generate_signed_prekey(&self.identity_key_pair, new_id, &mut rng);
        self.signed_prekeys
            .insert(SignedPreKeyId::from(new_id), new_prekey.clone());
        self.signed_prekey = new_prekey;
    }
}

fn generate_signed_prekey<R: Rng + CryptoRng>(
    identity: &IdentityKeyPair,
    id: u32,
    rng: &mut R,
) -> SignedPreKeyRecord {
    let keypair = KeyPair::generate(rng);
    let public_bytes = keypair.public_key.serialize();
    let signature = identity
        .private_key()
        .calculate_signature(&public_bytes, rng)
        .expect("identity private key signature failed");
    SignedPreKeyRecord::new(
        SignedPreKeyId::from(id),
        Timestamp::from_epoch_millis(Utc::now().timestamp_millis() as u64),
        &keypair,
        &signature,
    )
}

fn generate_prekeys<R: Rng + CryptoRng>(
    start_id: u32,
    end_id_inclusive: u32,
    rng: &mut R,
) -> HashMap<PreKeyId, PreKeyRecord> {
    let mut out = HashMap::new();
    for id in start_id..=end_id_inclusive {
        let keypair = KeyPair::generate(rng);
        out.insert(PreKeyId::from(id), PreKeyRecord::new(PreKeyId::from(id), &keypair));
    }
    out
}

#[derive(Clone)]
pub struct OmemoIdentityStore(pub StoreRef);

#[async_trait(?Send)]
impl IdentityKeyStore for OmemoIdentityStore {
    async fn get_identity_key_pair(&self) -> SignalResult<IdentityKeyPair> {
        Ok(self.0 .0.borrow().identity_key_pair.clone())
    }

    async fn get_local_registration_id(&self) -> SignalResult<u32> {
        Ok(self.0 .0.borrow().registration_id)
    }

    async fn save_identity(
        &mut self,
        address: &ProtocolAddress,
        identity: &IdentityKey,
    ) -> SignalResult<IdentityChange> {
        let mut state = self.0 .0.borrow_mut();
        let changed = state
            .trusted
            .get(address)
            .is_some_and(|existing| existing != identity);
        state.trusted.insert(address.clone(), *identity);
        Ok(IdentityChange::from_changed(changed))
    }

    async fn is_trusted_identity(
        &self,
        address: &ProtocolAddress,
        identity: &IdentityKey,
        _direction: Direction,
    ) -> SignalResult<bool> {
        let state = self.0 .0.borrow();
        Ok(state
            .trusted
            .get(address)
            .map(|known| known == identity)
            .unwrap_or(true))
    }

    async fn get_identity(&self, address: &ProtocolAddress) -> SignalResult<Option<IdentityKey>> {
        Ok(self.0 .0.borrow().trusted.get(address).copied())
    }
}

#[derive(Clone)]
pub struct OmemoPreKeyStore(pub StoreRef);

#[async_trait(?Send)]
impl PreKeyStore for OmemoPreKeyStore {
    async fn get_pre_key(&self, prekey_id: PreKeyId) -> SignalResult<PreKeyRecord> {
        self.0
            .0
            .borrow()
            .prekeys
            .get(&prekey_id)
            .cloned()
            .ok_or(SignalProtocolError::InvalidPreKeyId)
    }

    async fn save_pre_key(
        &mut self,
        prekey_id: PreKeyId,
        record: &PreKeyRecord,
    ) -> SignalResult<()> {
        self.0 .0.borrow_mut().prekeys.insert(prekey_id, record.clone());
        Ok(())
    }

    async fn remove_pre_key(&mut self, prekey_id: PreKeyId) -> SignalResult<()> {
        self.0 .0.borrow_mut().prekeys.remove(&prekey_id);
        Ok(())
    }
}

#[derive(Clone)]
pub struct OmemoSignedPreKeyStore(pub StoreRef);

#[async_trait(?Send)]
impl SignedPreKeyStore for OmemoSignedPreKeyStore {
    async fn get_signed_pre_key(
        &self,
        signed_prekey_id: SignedPreKeyId,
    ) -> SignalResult<SignedPreKeyRecord> {
        let state = self.0 .0.borrow();
        if let Some(rec) = state.signed_prekeys.get(&signed_prekey_id) {
            return Ok(rec.clone());
        }
        Ok(state.signed_prekey.clone())
    }

    async fn save_signed_pre_key(
        &mut self,
        signed_prekey_id: SignedPreKeyId,
        record: &SignedPreKeyRecord,
    ) -> SignalResult<()> {
        let mut state = self.0 .0.borrow_mut();
        state.signed_prekey = record.clone();
        state.signed_prekeys.insert(signed_prekey_id, record.clone());
        Ok(())
    }
}

#[derive(Clone)]
pub struct OmemoSessionStore(pub StoreRef);

#[async_trait(?Send)]
impl SessionStore for OmemoSessionStore {
    async fn load_session(&self, address: &ProtocolAddress) -> SignalResult<Option<SessionRecord>> {
        Ok(self.0 .0.borrow().sessions.get(address).cloned())
    }

    async fn store_session(
        &mut self,
        address: &ProtocolAddress,
        record: &SessionRecord,
    ) -> SignalResult<()> {
        self.0
            .0
            .borrow_mut()
            .sessions
            .insert(address.clone(), record.clone());
        Ok(())
    }
}
