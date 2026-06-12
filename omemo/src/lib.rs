use wasm_bindgen::prelude::*;

pub mod crypto;
pub mod store;
pub mod wasm;

#[wasm_bindgen(start)]
pub fn start() {
    console_error_panic_hook::set_once();
}
