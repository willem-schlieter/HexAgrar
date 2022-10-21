mod utils;
mod hexagrar;
use hexagrar::*;

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

#[wasm_bindgen]
pub struct TogreCalculator {
    db: T::DB
}
#[wasm_bindgen]
impl TogreCalculator {
    pub fn new() -> TogreCalculator {
        utils::set_panic_hook();
        TogreCalculator { db: T::DB::new() }
    }
    pub fn calc(&mut self, poscode: &str, p: &str) -> i8 {
        match self.db.calc(&H::Pos::from(poscode), H::Player::from(p), false).t {
            H::Togre::X => 1,
            H::Togre::O => -1,
            H::Togre::R => 0
        }
    }
}
