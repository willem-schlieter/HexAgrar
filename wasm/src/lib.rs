mod utils;
mod hexagrar;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern {
    pub fn alert(message: &str);
}

#[wasm_bindgen]
pub struct TogreCalculator {
    db: hexagrar::T::DB
}
#[wasm_bindgen]
impl TogreCalculator {
    pub fn new() -> TogreCalculator {
        utils::set_panic_hook();
        TogreCalculator { db: hexagrar::T::DB::new() }
    }
    pub fn calc(&mut self, poscode: &str, p: &str) -> i8 {
        match self.db.calc(&hexagrar::H::Pos::from(poscode), hexagrar::H::Player::from(p), false).t {
            hexagrar::H::Togre::X => 1,
            hexagrar::H::Togre::O => -1,
            hexagrar::H::Togre::R => 0
        }
    }
}

#[wasm_bindgen]
pub struct BTRS {
    c: hexagrar::BTRS::Calculator,
    pub d: u8
}
#[wasm_bindgen]
impl BTRS {
    pub fn new(tiefenlimit: u8, compl: u8) -> BTRS { BTRS { c: hexagrar::BTRS::Calculator::new(tiefenlimit, compl), d: 19 } }
    pub fn answer(&mut self, poscode: &str, p: &str) -> String {
        self.c.answer(hexagrar::H::Pos::from(poscode), &hexagrar::H::Player::from(p)).write()
    }
    pub fn calc(&mut self, poscode: &str, p: &str) -> i8 {
        self.c.calc(&hexagrar::H::Pos::from(poscode), &hexagrar::H::Player::from(p))
    }

}