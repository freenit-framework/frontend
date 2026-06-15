use std::collections::HashMap;
use std::error::Error;
use std::sync::{Arc, Mutex};

use dziber_omemo::account::OmemoAccount;
use dziber_omemo::manager::CachedBundle;
use dziber_omemo::signal_ratchet::Session;
use dziber_omemo::store::OmemoStore;
use dziber_omemo::trust::{TrustStatus, TrustStore};
use serde::{Deserialize, Serialize};

const SERIALIZED_VERSION: u32 = 1;

/// In-memory OMEMO store data shared between the `OmemoStore` implementation
/// and the WASM wrapper.  The whole structure is serialized to a byte blob
/// that the JS side persists in IndexedDB.
#[derive(Clone, Default)]
pub struct StoreData {
    pub pickle_key: [u8; 32],
    pub device_id: u32,
    pub account_pickle: Vec<u8>,
    pub sessions: HashMap<String, HashMap<u32, Session>>,
    pub device_lists: HashMap<String, Vec<u32>>,
    pub bundle_cache: HashMap<String, HashMap<u32, CachedBundle>>,
    pub trust_entries: Vec<(String, u32, TrustStatus)>,
}

#[derive(Clone)]
pub struct WasmStore {
    data: Arc<Mutex<StoreData>>,
}

impl WasmStore {
    pub fn new(data: StoreData) -> Self {
        Self {
            data: Arc::new(Mutex::new(data)),
        }
    }

    pub fn generate_key() -> [u8; 32] {
        let mut key = [0u8; 32];
        rand::RngCore::fill_bytes(&mut rand::thread_rng(), &mut key);
        key
    }

    pub fn serialize(&self) -> Result<Vec<u8>, Box<dyn Error>> {
        let data = self.data.lock().map_err(|e| e.to_string())?;

        let mut sessions = HashMap::with_capacity(data.sessions.len());
        for (jid, devices) in &data.sessions {
            let mut device_sessions = HashMap::with_capacity(devices.len());
            for (device_id, session) in devices {
                device_sessions.insert(*device_id, session.pickle(&data.pickle_key));
            }
            sessions.insert(jid.clone(), device_sessions);
        }

        let store = SerializedStore {
            version: SERIALIZED_VERSION,
            pickle_key: data.pickle_key,
            device_id: data.device_id,
            account_pickle: data.account_pickle.clone(),
            sessions,
            device_lists: data.device_lists.clone(),
            bundle_cache: data.bundle_cache.clone(),
            trust_entries: data.trust_entries.clone(),
        };

        Ok(bincode::serialize(&store)?)
    }

    pub fn deserialize(bytes: &[u8]) -> Result<StoreData, Box<dyn Error>> {
        let store: SerializedStore = bincode::deserialize(bytes)?;
        if store.version != SERIALIZED_VERSION {
            return Err(format!("unsupported store version: {}", store.version).into());
        }

        let mut sessions = HashMap::with_capacity(store.sessions.len());
        for (jid, devices) in store.sessions {
            let mut device_sessions = HashMap::with_capacity(devices.len());
            for (device_id, pickle) in devices {
                device_sessions.insert(device_id, Session::unpickle(&pickle, &store.pickle_key)?);
            }
            sessions.insert(jid, device_sessions);
        }

        Ok(StoreData {
            pickle_key: store.pickle_key,
            device_id: store.device_id,
            account_pickle: store.account_pickle,
            sessions,
            device_lists: store.device_lists,
            bundle_cache: store.bundle_cache,
            trust_entries: store.trust_entries,
        })
    }
}

#[derive(Serialize, Deserialize)]
struct SerializedStore {
    version: u32,
    pickle_key: [u8; 32],
    device_id: u32,
    account_pickle: Vec<u8>,
    sessions: HashMap<String, HashMap<u32, Vec<u8>>>,
    device_lists: HashMap<String, Vec<u32>>,
    bundle_cache: HashMap<String, HashMap<u32, CachedBundle>>,
    trust_entries: Vec<(String, u32, TrustStatus)>,
}

impl OmemoStore for WasmStore {
    fn load_or_generate_pickle_key(&self) -> [u8; 32] {
        let mut data = self.data.lock().expect("OMEMO store lock poisoned");
        if data.pickle_key == [0u8; 32] {
            data.pickle_key = Self::generate_key();
        }
        data.pickle_key
    }

    fn load_account(
        &self,
        key: &[u8; 32],
    ) -> Result<Option<OmemoAccount>, Box<dyn Error>> {
        let data = self.data.lock().map_err(|e| e.to_string())?;
        if data.account_pickle.is_empty() {
            return Ok(None);
        }
        let mut account = OmemoAccount::unpickle(&data.account_pickle, key)
            .ok_or("failed to unpickle OMEMO account")?;
        account.device_id = data.device_id;
        Ok(Some(account))
    }

    fn save_account(
        &self,
        account: &OmemoAccount,
        key: &[u8; 32],
    ) -> Result<(), Box<dyn Error>> {
        let mut data = self.data.lock().map_err(|e| e.to_string())?;
        data.account_pickle = account.pickle(key);
        data.device_id = account.device_id;
        Ok(())
    }

    fn load_legacy_sessions(
        &self,
        _key: &[u8; 32],
    ) -> Result<HashMap<String, HashMap<u32, Session>>, Box<dyn Error>> {
        let data = self.data.lock().map_err(|e| e.to_string())?;
        Ok(data.sessions.clone())
    }

    fn save_legacy_sessions(
        &self,
        sessions: &HashMap<String, HashMap<u32, Session>>,
        _key: &[u8; 32],
    ) -> Result<(), Box<dyn Error>> {
        let mut data = self.data.lock().map_err(|e| e.to_string())?;
        data.sessions = sessions.clone();
        Ok(())
    }

    fn load_device_lists(&self) -> Result<HashMap<String, Vec<u32>>, Box<dyn Error>> {
        let data = self.data.lock().map_err(|e| e.to_string())?;
        Ok(data.device_lists.clone())
    }

    fn save_device_lists(
        &self,
        lists: &HashMap<String, Vec<u32>>,
    ) -> Result<(), Box<dyn Error>> {
        let mut data = self.data.lock().map_err(|e| e.to_string())?;
        data.device_lists = lists.clone();
        Ok(())
    }

    fn load_bundle_cache(
        &self,
    ) -> Result<HashMap<String, HashMap<u32, CachedBundle>>, Box<dyn Error>> {
        let data = self.data.lock().map_err(|e| e.to_string())?;
        Ok(data.bundle_cache.clone())
    }

    fn save_bundle_cache(
        &self,
        cache: &HashMap<String, HashMap<u32, CachedBundle>>,
    ) -> Result<(), Box<dyn Error>> {
        let mut data = self.data.lock().map_err(|e| e.to_string())?;
        data.bundle_cache = cache.clone();
        Ok(())
    }

    fn load_trust_store(&self) -> Result<TrustStore, Box<dyn Error>> {
        let data = self.data.lock().map_err(|e| e.to_string())?;
        let mut store = TrustStore::new();
        for (jid, device_id, status) in &data.trust_entries {
            store.set(jid, *device_id, status.clone());
        }
        Ok(store)
    }

    fn save_trust_store(&self, store: &TrustStore) -> Result<(), Box<dyn Error>> {
        let mut data = self.data.lock().map_err(|e| e.to_string())?;
        data.trust_entries = store.all_entries();
        Ok(())
    }
}
