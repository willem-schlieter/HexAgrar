mod utils;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern {
    pub fn alert(message: &str);
}

#[wasm_bindgen]
pub struct WasmTest { value: u8 }

#[wasm_bindgen]
impl WasmTest {
    pub fn new(value: u8) -> WasmTest {
        WasmTest { value }
    }
    pub fn greet(&self) {
        alert(&format!("Hello from WasmTest! The Magic Number of your WasmTest is: {}", self.value));
    }
}