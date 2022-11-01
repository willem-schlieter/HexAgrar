mod utils;
mod hexagrar;
use hexagrar::{ BTRS, H };

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
    pub fn len(&self) -> usize {
        self.db.len()
    }
}

#[wasm_bindgen]
pub struct BTRSInterface {
    db: BTRS::DB
}
#[wasm_bindgen]
impl BTRSInterface {

    pub fn new() -> BTRSInterface {
        utils::set_panic_hook();
        BTRSInterface { db: BTRS::DB::new() }
    }

    pub fn answer(&mut self, poscode: &str, p: &str, tiefe: u8, compl: u8) -> String {
        BTRS::answer(&mut self.db, H::Pos::from(poscode), &H::Player::from(p), tiefe, compl).write()
    }

    pub fn calc(&mut self, poscode: &str, p: &str, tiefe: u8, compl: u8) -> i8 {
        // self.c.calc(&hexagrar::H::Pos::from(poscode), &hexagrar::H::Player::from(p))
        BTRS::calc(&mut self.db, &H::Pos::from(poscode), &H::Player::from(p), tiefe, compl)
    }

}