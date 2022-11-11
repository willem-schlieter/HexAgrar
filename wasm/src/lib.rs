mod utils;
mod hexagrar;
use hexagrar::{ BTRS, H };

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern {
    pub fn alert(message: &str);
}

#[wasm_bindgen]
pub struct TOGREInterface {
    db: hexagrar::T::DB
}
#[wasm_bindgen]
impl TOGREInterface {
    pub fn new(db_code: &str, symmeth: u8, reviter: bool, prefmat: bool) -> TOGREInterface {
        utils::set_panic_hook();
        let mut res = TOGREInterface { db: hexagrar::T::DB::from(db_code.to_string()) };
        if symmeth != 0 && symmeth != 1 && symmeth != 2 && symmeth != 3 {
            panic!("Ungültige Symmeth: {}", symmeth);
        }
        res.db.symmeth = symmeth;
        res.db.reviter = reviter;
        res.db.prefmat = prefmat;
        res
    }
    pub fn calc(&mut self, poscode: &str, p: &str) -> i8 {
        match self.db.calc(&hexagrar::H::Pos::from(poscode).unwrap(), &hexagrar::H::Player::from(p).unwrap(), false).t {
            hexagrar::H::Togre::X => 1,
            hexagrar::H::Togre::O => -1,
            hexagrar::H::Togre::R => 0
        }
    }
    pub fn get(&mut self, poscode: &str, p: &str) -> i8 {
        match self.db.get(&hexagrar::H::Pos::from(poscode).unwrap(), &hexagrar::H::Player::from(p).unwrap()) {
            Some(hexagrar::H::Togre::X) => 1,
            Some(hexagrar::H::Togre::O) => -1,
            Some(hexagrar::H::Togre::R) => 0,
            None => -2
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
        BTRS::answer(&mut self.db, H::Pos::from(poscode).unwrap(), &H::Player::from(p).unwrap(), tiefe, compl).write()
    }

    pub fn calc(&mut self, poscode: &str, p: &str, tiefe: u8, compl: u8) -> i8 {
        // self.c.calc(&hexagrar::H::Pos::from(poscode), &hexagrar::H::Player::from(p))
        BTRS::calc(&mut self.db, &H::Pos::from(poscode).unwrap(), &H::Player::from(p).unwrap(), tiefe, compl)
    }

}