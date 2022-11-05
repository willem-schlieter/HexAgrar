/*
*/

#![allow(dead_code)]

pub const INFO: &str = "Ausgangsversion - Seit Oktober 2022 wird nur noch die maintained.";

#[allow(non_snake_case)]
pub mod H {

    use super::BTRS;

    const FIELDS: [char; 36] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

    #[derive(Debug, PartialEq, Eq, Hash, Clone)]
    pub struct Pos (pub Vec<i8>, pub Vec<i8>);
    impl Pos {
        
        /// Kodiert eine Collection (`Vec<Pos>`) zu einem `String`, wobei die Stellungen durch ein `/` getrennt werden.
        pub fn write_collection(collection: &Vec<Pos>) -> String {
            collection.iter().map(|p| p.write()).collect::<Vec<String>>().join("/")
        }
        
        /// Dekodiert eine Collection aus einem kodierten `String` (Gegenstück zu `write_collection`).
        pub fn collection_from(code: String) -> Vec<Pos> {
            code.split("/").map(|c| Pos::from(c)).collect()
        }
        
        /// Erstellt eine leere Stellung.
        pub fn new() -> Pos { Pos(vec![], vec![]) }
        
        /// Erstellt eine Stellung aus einem gegebenen Code.
        pub fn from(code: &str) -> Pos {
            if code == "-" { return Pos::from("012345.uvwxyz") }
            let mut parts = code.split(".").collect::<Vec<&str>>();
            while parts.len() < 2 { parts.push("") };
            if parts.len() > 2 { panic!("Stellungscode {} ungültig.", code) }
            let mut res = [vec![], vec![]];
            for i in 0..2 {
                for ch in parts[i].chars() {
                    match IntoIterator::into_iter(FIELDS).position(|e| e == ch) {
                        Some(u) => {
                            if res[i].len() == 0 || res[i][res[i].len() - 1] < u as i8 { res[i].push(u as i8) }
                            else {
                                for ix in 0..res[i].len() {
                                    if res[i][ix] == u as i8 { break; }
                                    else if res[i][ix] > u as i8 { res[i].insert(ix, u as i8); break; }
                                }
                            }
                        },
                        None => panic!("Stellungscode {} ungültig.", code)
                    }
                }
            }
            Pos(res[0].clone(), res[1].clone())
        }
        
        /// Gibt den Code der Stellung aus.
        pub fn write(&self) -> String {
            let mut r = String::new();
            for f in self.0.iter() { r.push(FIELDS[*f as usize]); }
            r.push('.');
            for f in self.1.iter() { r.push(FIELDS[*f as usize]); }
            r
        }
        
        /// Gibt eine & zum Vec<i8> des angegebenen Players zurück.
        pub fn of(&self, player: &Player) -> &Vec<i8> {
            match player {
                Player::X => &(self.0),
                Player::O => &(self.1)
            }
        }
        
        /// Gibt eine &mut zum Vec<i8> des angegebenen Players zurück.
        pub fn of_mut(&mut self, player: &Player) -> &mut Vec<i8> {
            match player {
                Player::X => &mut (self.0),
                Player::O => &mut (self.1)
            }
        }
        
        /// Gibt zurück, ob ein Spieler gewonnen hat, sonst None.
        pub fn won(&self) -> Option<Player> {
            for f in self.0.iter() { if self.row_for(*f, &Player::X) == 5 { return Some(Player::X) } }
            for f in self.1.iter() { if self.row_for(*f, &Player::O) == 5 { return Some(Player::O) } }
            None
        }
        
        /// Gibt an, in welcher Reihe das gegebene Feld für den gegebenen Player ist.
        pub fn row_for(&self, feld: i8, player: &Player) -> i8 {
            if *player == Player::X {
                (feld - (feld % 6)) / 6
            } else {
                5 - (feld - (feld % 6)) / 6
            }
        }
        
        /// Berechnet die Komplexität der Stellung, also die Anzahl der Figuren, die sich im Heimbereich befinden.
        pub fn compl(&self) -> usize {
            self.0.iter().filter(|feld| self.row_for(**feld, &Player::X) < 2).collect::<Vec<&i8>>().len() + self.1.iter().filter(|feld| self.row_for(**feld, &Player::O) < 2).collect::<Vec<&i8>>().len()
            // let mut c: usize = 0;
            // for f in &self.0 { if self.row_for(*f, &Player::X) < 2 { c += 1 } };
            // for f in &self.1 { if self.row_for(*f, &Player::O) < 2 { c += 1 } };
            // c
        }
        
        /// Ermittelt alle möglichen Zielfelder, die ein Spieler von einem Feld aus in dieser Pos erreichen kann.
        pub fn zielfelder(&self, feld: i8, p: &Player, prefmat: bool) -> [Option<i8>; 4] {
            // Steht der angegebene Spieler überhaupt auf dem Feld?
            // Nur für dev, später uU löschen (wegen perf)
            if ! self.of(&p).contains(&feld) { panic!("In der Pos {:?} steht der Player {:?} nicht auf dem Feld {:?}.", self, p, feld) }
            else {
                let mut res: [Option<i8>; 4] = [None, None, None, None];
                // Nur weiter, wenn Figur nicht in der letzten Reihe.
                if ! (p.is_x() && feld > 29) || (! p.is_x() && feld < 6) {
                    // Zunächst die potenziellen Zielfelder bestimmen.
                    let ziele = (
                        // Schritt
                        feld + (p.m() * 6),
                        // Sprung
                        feld + (p.m() * 12),
                        // Nach rechts schlagen
                        feld + (p.m() * 5),
                        // Nach links schlagen
                        feld + (p.m() * 7),
                    );
                    // Dann einzeln überprüfen, ob man darauf ziehen kann.
                    // Wenn das Feld vor mir frei ist…
                    if ! (self.0.contains(&ziele.0) || self.1.contains(&ziele.0)) {
                        // …kann ich einen Schritt machen.
                        res[0] = Some(ziele.0);
                        // Wenn außerdem das Feld davor frei ist…
                        if ! (self.0.contains(&ziele.1) || self.1.contains(&ziele.1)) &&
                        // …und ich in der Initialreihe stehe…
                        (feld < 6 || feld > 29) // (Wobei es hier kein Problem darstellt, dass theoretisch Initial- und Zielreihe (wegen mangelnder Fallunterscheidung nach Playern) nicht auseinandergehalten werden, weil Figuren in der Zielreihe oben bereits ausgeschlossen wurden.)
                        // …dann kann ich auch springen.
                        { res[1] = Some(ziele.1); }
                    }
                    // Wenn nun `feld` nicht am rechten Rand ist…
                    if ((feld + ((p.m() - 1) / -2)) % 6) != 0 &&
                    // …und schräg rechts davor der Gegner steht…
                        self.of(&p.not()).contains(&ziele.2)
                    // …dann kann man ihn dort schlagen.
                    { res[2] = Some(ziele.2); }

                    // Wenn andersherum `feld` nicht am linken Rand ist…
                    if ((feld + ((p.m() + 1) / 2)) % 6) != 0 &&
                    // …und schräg links davor der Gegner steht…
                        self.of(&p.not()).contains(&ziele.3)
                    // … dann kann man ihn dort schlagen.
                    { res[3] = Some(ziele.3); }
                }
                if prefmat { [res[2], res[3], res[1], res[0]] } else { res }
            }
        }
        
        /// Wendet einen Zug auf self an und gibt die resultierende Stellung zurück.
        pub fn zug_anwenden(&self, startfeld: i8, zielfeld: i8, p: &Player) -> Pos {
            let (mut eigenes, mut anderes) = (vec![], vec![]);
            let mut weiter = true;
            for f in self.of(p) {
                if weiter && *f > zielfeld {
                    eigenes.push(zielfeld);
                    weiter = false;
                }
                if *f == zielfeld { weiter = false; }
                if *f != startfeld { eigenes.push(*f); }
            }
            for f in self.of(&p.not()) {
                if *f != zielfeld { anderes.push(*f); }
            }
            if weiter { eigenes.push(zielfeld); }
            if p == &Player::X { Pos(eigenes, anderes) } else { Pos(anderes, eigenes) }
        }
        
        /// Gibt einen Vector mit allen möglichen Folgestellungen zurück.
        pub fn folgestellungen(&self, p: &Player) -> Vec<Pos> {
            let mut res: Vec<Pos> = vec![];
            for feld in self.of(p) {
                // Nur weiter, wenn Figur nicht in der letzten Reihe.
                if ! (p.is_x() && *feld > 29) || (! p.is_x() && *feld < 6) {
                    // Zunächst die potenziellen Zielfelder bestimmen.
                    let ziele = (
                        // Schritt
                        feld + (p.m() * 6),
                        // Sprung
                        feld + (p.m() * 12),
                        // Nach rechts schlagen
                        feld + (p.m() * 5),
                        // Nach links schlagen
                        feld + (p.m() * 7),
                    );
                    // Dann einzeln überprüfen, ob man darauf ziehen kann.
                    // Wenn das Feld vor mir frei ist…
                    if ! (self.0.contains(&ziele.0) || self.1.contains(&ziele.0)) {
                        // …kann ich einen Schritt machen.
                        res.push(self.zug_anwenden(*feld, ziele.0, p));
                        // Wenn außerdem das Feld davor frei ist…
                        if ! (self.0.contains(&ziele.1) || self.1.contains(&ziele.1)) &&
                        // …und ich in der Initialreihe stehe…
                        (*feld < 6 || *feld > 29) // (Wobei es hier kein Problem darstellt, dass theoretisch Initial- und Zielreihe (wegen mangelnder Fallunterscheidung nach Playern) nicht auseinandergehalten werden, weil Figuren in der Zielreihe oben bereits ausgeschlossen wurden.)
                        // …dann kann ich auch springen.
                        { res.push(self.zug_anwenden(*feld, ziele.1, p)); }
                    }
                    // Wenn nun `feld` nicht am rechten Rand ist…
                    if ((feld + ((p.m() - 1) / -2)) % 6) != 0 &&
                    // …und schräg rechts davor der Gegner steht…
                        self.of(&p.not()).contains(&ziele.2)
                    // …dann kann man ihn dort schlagen.
                    { res.push(self.zug_anwenden(*feld, ziele.2, p)); }

                    // Wenn andersherum `feld` nicht am linken Rand ist…
                    if ((feld + ((p.m() + 1) / 2)) % 6) != 0 &&
                    // …und schräg links davor der Gegner steht…
                        self.of(&p.not()).contains(&ziele.3)
                    // … dann kann man ihn dort schlagen.
                    { res.push(self.zug_anwenden(*feld, ziele.3, p)); }
                }
            }
            res
        }
    
        /// Spiegelt die Stellung linsk/rechts.
        // 49.7% Einsparung bei den Einträgen in der DB.
        pub fn mirror_x(&self) -> Pos {
            let mut x: Vec<i8> = vec![];
            let mut o: Vec<i8> = vec![];
            for f in &self.0 {
                x.push(f - (f % 6) + (5 - (f % 6)));
            };
            for f in &self.1 {
                o.push(f - (f % 6) + (5 - (f % 6)));
            };
            x.sort_unstable();
            o.sort_unstable();
            Pos ( x, o )
        }

        /// Spiegelt die Stellung oben/unten. ACHTUNG: p und Togre-Zahl umdrehen!
        // 42.8% Einsparung bei den Einträgen in der DB.
        pub fn mirror_y(&self) -> Pos {
            let mut x: Vec<i8> = vec![];
            let mut o: Vec<i8> = vec![];
            for f in &self.0 {
                o.push(f + (((f - (f % 6)) / 3) - 5) * -6);
            }
            for f in &self.1 {
                x.push(f + (((f - (f % 6)) / 3) - 5) * -6);
            }
            x.sort_unstable();
            o.sort_unstable();
            Pos ( x, o )
        }
    }

    pub struct Zug { pub from: i8, pub to: i8 }

    #[derive(PartialEq, Debug, Copy, Clone)]
    pub enum Player { X, O }
    impl Player {
        pub fn not(&self) -> Player {
            match self {
                Player::X => Player::O,
                Player::O => Player::X
            }
        }
        pub fn togre(&self) -> Togre {
            match self {
                Player::X => Togre::X,
                Player::O => Togre::O
            }
        }
        pub fn m(&self) -> i8 {
            match self {
                Player::X => 1,
                Player::O => -1
            }
        }
        pub fn c(&self) -> char {
            match self {
                Player::X => 'x',
                Player::O => 'O'
            }
        }
        pub fn is_x(&self) -> bool {
            self == &Player::X
        }
        pub fn is_o(&self) -> bool {
            self == &Player::O
        }
        pub fn score(&self) -> BTRS::Score {
            self.togre().score()
        }
        pub fn from(code: &str) -> Player {
            match code {
                "X" | "x" => Player::X,
                "O" | "o" => Player::O,
                _ => panic!("Invalid player code: {}", code)
            }
        }
    }

    #[derive(PartialEq, Debug, Copy, Clone)]
    pub enum Togre { X, O, R }
    impl Togre {
        pub fn write(&self) -> char {
            match self {
                Togre::X => 'X',
                Togre::O => 'O',
                Togre::R => 'R'
            }
        }
        pub fn write_option(option: Option<Togre>) -> char {
            match option {
                Some(t) => t.write(),
                None => '?'
            }
        }
        pub fn score(&self) -> i8 {
            match self {
                Togre::X => BTRS::SCORE_FINAL,
                Togre::O => -1 * BTRS::SCORE_FINAL,
                Togre::R => 0
            }
        }
        pub fn from_score(score: i8) -> Option<Togre> {
            if score == BTRS::SCORE_FINAL { Some(Togre::X) }
            else if score == BTRS::SCORE_FINAL * -1 { Some(Togre::O) }
            else if score == 0 { Some(Togre::R) }
            else { None }
        }
        pub fn neg(&self) -> Togre {
            match self {
                Togre::X => Self::O,
                Togre::O => Self::X,
                Togre::R => Self::R
            }
        }
    }
}

#[allow(non_snake_case)]
pub mod T {
    use std::{collections::HashMap, thread, time::Instant};
    use super::H;
    use H::{ Togre, Pos, Player };
    use std::sync::{Arc, Mutex};

    #[derive(Debug)]
    pub struct DB {
        x: HashMap<H::Pos, H::Togre>,
        o: HashMap<H::Pos, H::Togre>,
        times: (i64, i64, i64), // i, get, set
        pub symmeth: u8,
        pub reviter: bool,
        pub prefmat: bool
    }
    impl DB {
        
        /// Erstellt eine neue, leere `DB`.
        pub fn new() -> DB {
            DB {
                x: HashMap::new(),
                o: HashMap::new(),
                times: (0, 0, 0),
                symmeth: 3,
                reviter: true,
                prefmat: false
            }
        }
        
        /// Dekodiert eine `DB` aus einem kodierten `String` (Gegenstück zu `write`).
        pub fn from(code: String) -> DB {
            let mut db = DB::new();
            let parts = code.split("%%").collect::<Vec<&str>>()[1].to_string().split("#").map(|s| s.to_string()).collect::<Vec<String>>().iter().map(|part| part.split("/").map(|c| Pos::from(c)).collect::<Vec<Pos>>()).collect::<Vec<Vec<Pos>>>();
            // x_x
            for pos in &parts[0] { db.x.insert(pos.clone(), Togre::X); }
            // x_o
            for pos in &parts[1] { db.x.insert(pos.clone(), Togre::O); }
            // x_r
            for pos in &parts[2] { db.x.insert(pos.clone(), Togre::R); }
            // o_x
            for pos in &parts[3] { db.o.insert(pos.clone(), Togre::X); }
            // o_o
            for pos in &parts[4] { db.o.insert(pos.clone(), Togre::O); }
            // o_r
            for pos in &parts[5] { db.o.insert(pos.clone(), Togre::R); }
            db
        }
        
        /// Gibt die Gesamtzahl aller Einträge aus.
        pub fn len(&self) -> usize {
            self.x.len() + self.o.len()
        }
        
        /// Gibt eine `Some(Togre)` zurück, wenn `pos`/`p` in der `DB` enthalten sind, sonst `None`.
        pub fn get(&mut self, pos: &H::Pos, p: &H::Player) -> Option<H::Togre> {
            self.times.1 += 1;
            let map = if *p == H::Player::X { &self.x } else { &self.o };
            if let Some(t) = map.get(&pos) {
                return Some(*t);
            }
            if self.symmeth == 1 || self.symmeth == 3 {
                if let Some(t) = map.get(&pos.mirror_x()) {
                    return Some(*t);
                }
            }
            if self.symmeth > 1 {
                let other_map = if *p == H::Player::O { &self.x } else { &self.o };
                let newpos = pos.mirror_y();
                if let Some(t) = other_map.get(&newpos) {
                    return Some(t.neg());
                }
                if self.symmeth == 3 {
                    if let Some(t) = other_map.get(&newpos.mirror_x()) {
                        return Some(t.neg());
                    }
                }
            }
            return None;
        }
        
        /// Setzt `pos`/`p` auf Togre `t`.
        pub fn set(&mut self, pos: H::Pos, p: &H::Player, t: &H::Togre) {
            self.times.2 += 1;
            (if *p == H::Player::X { &mut self.x } else { &mut self.o }).insert(pos, *t);
        }
        
        /// Berechnet die `Togre`-Zahl für `pos`/`p` und gibt ein `CalcResult` zurück.
        pub fn get_by_score(&mut self, pos: &Pos, p: &Player) -> Option<i8> {
            match self.get(pos, p) {
                Some(togr) => Some(togr.score()),
                None => None
            }
        }
        
        pub fn set_by_score(&mut self, pos: Pos, p: &Player, score: i8) {
            match Togre::from_score(score) {
                Some(togr) => self.set(pos, p, &togr),
                None => { }
            }
        }
        
        /// Importiert sämtliche Inhalte der DB `other` in diese DB.
        pub fn import(&mut self, other: DB) -> &mut Self {
            self.import_filtered(&other, |_| true)
        }
    
        /// Importiert alle Einträge aus `other`, die die `condition` erfüllen, in diese DB.
        pub fn import_filtered<C>(&mut self, other: &DB, condition: C) -> &mut Self
        where C: Fn(&Pos) -> bool {
            for entry in &other.x {
                match self.get(entry.0, &Player::X) {
                    Some(t) => {
                        if &t != entry.1 {
                            panic!("Die Einträge für {}/X stimmen nicht überein. Self: {}, Imported: {}", entry.0.write(), t.write(), entry.1.write());
                        }
                    }
                    None => {
                        if condition(&entry.0) {
                            self.set(entry.0.clone(), &Player::X, entry.1);
                        }
                    }
                }
            }
            for entry in &other.o {
                match self.get(entry.0, &Player::O) {
                    Some(t) => {
                        if &t != entry.1 {
                            panic!("Die Einträge für {}/O stimmen nicht überein. Self: {}, Imported: {}", entry.0.write(), t.write(), entry.1.write());
                        }
                    }
                    None => {
                        if condition(&entry.0) {
                            self.set(entry.0.clone(), &Player::O, entry.1);
                        }
                    }
                }
            }
            self
        }

        pub fn calc(&mut self, pos: &Pos, p: &H::Player, full: bool) -> CalcResult {
            let old_len = self.len();
            let t = match pos.won() {
                Some(p) => p.togre(),
                None => {
                    match self.get(&pos, &p) {
                        Some(t) => t,
                        None => if full { self.i_full(pos, &p) } else { self.i(pos, &p) }
                    }
                }
            };
            self.set(Pos::from(&pos.write()), &p, &t);
            CalcResult {
                pos: pos.write(),
                p: p.c(),
                t,
                entries: self.len() - old_len,
                times: self.times
            }
        }
        
        /// ***Nur für internen Gebrauch:*** Rekursive Kernfunktion zur Togre-Berechnung.
        fn i(&mut self, pos: &H::Pos, p: &H::Player) -> H::Togre {
            self.times.0 += 1;
            // pos ist garantiert nicht gewonnen und nicht in der DB. (Denn bei rekursivem Aufruf wurde dies schon vorher geprüft, s.u., und der manuelle Aufruf sollte über calc erfolgen, wo dies auch geschieht, s.o.)
            
            let mut is_remis = true;    // pos ist final remis.
            let mut is_r = false;       // pos ist Togre-neutral.
            let mut later: Vec<Pos> = vec![];
            
            // Wir iterieren zunächst über die möglichen Startfelder.
            // let index_slice = if self.reviter && p.is_x() { pos.0.len()..0 } else { 0..pos.of(p).len() };
            let len = pos.of(p).len();
            for ix in 0..len {
                let startfeld = pos.of(p)[if self.reviter && p.is_x() { len - (ix + 1) } else { ix }];
                for zielfeld_op in pos.zielfelder(startfeld, p, self.prefmat) {
                    if let Some(zielfeld) = zielfeld_op {
                        is_remis = false;
                        let n = pos.zug_anwenden(startfeld, zielfeld, p);
                        let t: Option<H::Togre> = match self.get(&n, &p.not()) {
                            Some(saved) => Some(saved),
                            None => {
                                match n.won() {
                                    Some(won) => Some(won.togre()),
                                    None => None
                                }
                            }
                        };
                        if let Some(togr) = t {
                            if togr == p.togre() { return togr; }
                            else if togr == H::Togre::R { is_r = true; }
                        } else { later.push(n) };
                    }
                }
            }
            for late in later {
                let t = self.i(&late, &p.not());
                // ggf. compl-Threshold einfügen
                self.set(late, &p.not(), &t);
                if t == p.togre() { return t; }
                else if t == H::Togre::R { is_r = true; }
            }
            if is_r || is_remis { H::Togre::R } else { p.not().togre() }
        }
        
        fn i_full(&mut self, pos: &Pos, p: &Player) -> Togre {
            self.times.0 += 1;
            // pos ist garantiert nicht gewonnen und nicht in der DB. (Denn bei rekursivem Aufruf wurde dies schon vorher geprüft, s.u., und der manuelle Aufruf sollte über calc erfolgen, wo dies auch geschieht, s.o.)
            
            let mut neutral = false;
            let mut positiv = false;
            let folgestellungen = pos.folgestellungen(p);
            if folgestellungen.len() == 0 { Togre::R }
            else {
                for fs in folgestellungen {
                    let t = match self.get(&fs, &p.not()) {
                        Some(saved) => saved,
                        None => {
                            match fs.won() {
                                Some(won) => won.togre(),
                                None => {
                                    let t = self.i_full(&fs, &p.not());
                                    self.set(fs, &p.not(), &t);
                                    t
                                }
                            }
                        }
                    };
                    if t == p.togre() { positiv = true; }
                    else if t == Togre::R { neutral = true; }
                };
                if positiv { p.togre() } else if neutral { Togre::R } else { p.not().togre() }
            }
        }
        
        /// Kodiert die `DB` in einen String.
        pub fn write(&self) -> String {
            let mut x_x: Vec<Pos> = vec![];
            let mut x_o: Vec<Pos> = vec![];
            let mut x_r: Vec<Pos> = vec![];
            for (pos, togre) in &self.x {
                match togre {
                    H::Togre::X => &mut x_x,
                    H::Togre::O => &mut x_o,
                    H::Togre::R => &mut x_r
                }.push(pos.clone());
            }
            let mut o_x: Vec<Pos> = vec![];
            let mut o_o: Vec<Pos> = vec![];
            let mut o_r: Vec<Pos> = vec![];
            for (pos, togre) in &self.o {
                match togre {
                    H::Togre::X => &mut o_x,
                    H::Togre::O => &mut o_o,
                    H::Togre::R => &mut o_r
                }.push(pos.clone());
            }
            let mut res = String::from("Rusty Togre DB saved as string in format x_x x_o x_r o_x o_o o_r. Data follows here: %%");
            res.push_str(&([
                Pos::write_collection(&x_x),
                Pos::write_collection(&x_o),
                Pos::write_collection(&x_r),
                Pos::write_collection(&o_x),
                Pos::write_collection(&o_o),
                Pos::write_collection(&o_r)
            ].join("#")));
            res
        }
    
    }

    fn get_conc(db_mutex: Arc<Mutex<DB>>, pos: &H::Pos, p: &H::Player) -> (Option<H::Togre>, Arc<Mutex<DB>>) {
        let mut db = db_mutex.lock().unwrap();
        let res = db.get(pos, p);
        drop(db);
        (res, db_mutex)
    }

    fn i_conc(db_mutex: Arc<Mutex<DB>>, pos: &H::Pos, p: &H::Player, thread_nr: u8, log: bool) -> (H::Togre, Arc<Mutex<DB>>) {
        // pos ist garantiert nicht gewonnen und nicht in der DB. (Denn bei rekursivem Aufruf wurde dies schon vorher geprüft, s.u., und der manuelle Aufruf sollte über calc erfolgen, wo dies auch geschieht, s.o.)
        
        // Wir werden das Mutex öfters an eine Funktion übergeben und es zurückbekommen. Um es dann weiter zu benutzen, müssen wir es wieder speichern. Da Parameter immutable sind, müssen wir db_mutex mutable moven.
        let mut mutex = db_mutex;
        
        let mut is_remis = true;    // pos ist final remis.
        let mut is_r = false;       // pos ist Togre-neutral.
        let mut later: Vec<Pos> = vec![];
        
        // Wir iterieren zunächst über die möglichen Startfelder.
        for startfeld in pos.of(p) {
            for zielfeld_op in pos.zielfelder(*startfeld, p, true) {
                if let Some(zielfeld) = zielfeld_op {
                    is_remis = false;
                    let n = pos.zug_anwenden(*startfeld, zielfeld, p);
                    if log { println!("#{}: Requesting to read.", thread_nr) }
                    let getres = get_conc(mutex, &n, &p.not());
                    if log { println!("#{}: Reading completed.", thread_nr) }
                    mutex = getres.1;
                    let t: Option<H::Togre> = match getres.0 {
                        Some(saved) => Some(saved),
                        None => {
                            match n.won() {
                                Some(won) => Some(won.togre()),
                                None => None
                            }
                        }
                    };
                    if let Some(togr) = t {
                        // Unglücklich. Ich sollte db_mutex nicht in jedem Rekursionsschritt klonen! Hatte aber ein komplexes Ownership-Problem, wenn ich einfach db_mutex zurückgebe, daher dieser Behelf. Möglichst irgendwann nochmal lösen.
                        if togr == p.togre() { return (togr, mutex); }
                        else if togr == H::Togre::R { is_r = true; }
                    } else { later.push(n) };
                }
            }
        }
        for late in later {
            let res = i_conc(mutex, &late, &p.not(), thread_nr, false);
            let t = res.0;
            mutex = res.1;
            // ggf. compl-Threshold einfügen
            if log { println!("#{}: Requesting to write.", thread_nr) }
            let mut db = mutex.lock().unwrap();
            db.set(late, &p.not(), &t);
            drop(db);
            if log { println!("#{}: Writing completed.", thread_nr) }
            if t == p.togre() { return (t, mutex); }
            else if t == H::Togre::R { is_r = true; }
        }
        if is_r || is_remis { (H::Togre::R, mutex) } else { (p.not().togre(), mutex) }
    }
    
    pub fn calc_conc(db: &mut DB, pos: &Pos, p: H::Player, threads: u8) -> CalcResult {
        let old_len = db.len();
        let t = match pos.won() {
            Some(p) => p.togre(),
            None => {
                match db.get(&pos, &p) {
                    Some(t) => t,
                    None => {
                        // pos ist nicht gewonnen und nicht in der DB.
                        let folgestellungen = pos.folgestellungen(&p);
                        if folgestellungen.len() == 0 { Togre::R }
                        else {
                            // pos ist nicht remis.
                            let db_arc = Arc::new(Mutex::new(DB::new()));
                            let fs_arc = Arc::new(Mutex::new(folgestellungen));
                            let mut handles = vec![];
                            for ix in 0..threads {
                                let mut db_mutex = Arc::clone(&db_arc);
                                let fs_mutex = Arc::clone(&fs_arc);
                                handles.push(thread::spawn(move || {
                                    println!("#{}: Start.", ix);
                                    loop {
                                        let mut fs = fs_mutex.lock().unwrap();
                                        if fs.len() == 0 {
                                            println!("#{}: FS ist leer. Beende Thread.", ix);
                                            drop(fs);
                                            break;
                                        } else {
                                            println!("#{}: Neue Berechnung.", ix);
                                            let s = fs.remove(0);
                                            drop(fs);
                                            db_mutex = i_conc(db_mutex, &s, &p.not(), ix, false).1;
                                        }
                                    }
                                    println!("#{}: Ende.", ix);
                                }));
                            }

                            for handle in handles {
                                handle.join().unwrap();
                            }
                            // Keine Ahnung, was das mit dem x soll. War ein Quick Fix.
                            let x = db_arc.lock().unwrap().calc(&pos, &p, false).t;
                            x
                        }
                    }
                }
            }
        };

        db.set(Pos::from(&pos.write()), &p, &t);
        CalcResult {
            pos: pos.write(),
            p: p.c(),
            t,
            entries: db.len() - old_len,
            times: db.times
        }
    }

    pub fn calc_para(root_db: &mut DB, pos: &Pos, p: Player, threads: u8) -> CalcResult {
        let start = Instant::now();
        let old_len = root_db.len();
        let t = match pos.won() {
            Some(p) => p.togre(),
            None => {
                match root_db.get(&pos, &p) {
                    Some(t) => t,
                    None => {
                        // pos ist nicht gewonnen und nicht in der DB.
                        let folgestellungen = pos.folgestellungen(&p);
                        if folgestellungen.len() == 0 { Togre::R }
                        else {
                            // pos ist nicht remis.

                            // Statt der Folgestellungen 1. Grades werden die 2. Grades berechnet. Das ermöglicht es, mehr Threads aufzumachen als die Anzahl der direkten Folgestellungen.
                            // Hoffnung war: Noch mehr Threads -> Wird schneller.
                            // Leider anscheinend nicht der Fall (jedenfalls bei 40 Threads wesentlich langsamer als bei 1.)
                            // Wenn ich das wieder rausnheme, nicht vergessen: Im Thread muss dann mit p.not gerechnet werden, weil ja dann Fs. 1. statt 2. Grades.
                            let mut rechenset = vec![];
                            for fs in folgestellungen {
                                for ffs in fs.folgestellungen(&p.not()) {
                                    rechenset.push(ffs);
                                }
                            }

                            // let mut rechensets = vec![(folgestellungen, p.not().is_x())];
                            // while rechensets[rechensets.len() - 1].0.len() < threads.into() {
                            //     let mut new: (Vec<Pos>, bool) = (vec![], ! rechensets[rechensets.len() - 1].1);
                            //     let p = if new.1 { Player::X } else { Player::O };
                            //     for s in rechensets[rechensets.len() - 1].0 {
                            //         for fs in s.folgestellungen(&p) {
                            //             new.0.push(s);
                            //         }
                            //     }
                            // }

                            let fs_arc = Arc::new(Mutex::new(rechenset));
                            let mut handles = vec![];

                            for ix in 0..threads {
                                let fs_mutex = Arc::clone(&fs_arc);
                                let mut thread_db = DB::new();
                                handles.push(thread::spawn(move || {
                                    println!("#{}: Start. [{}]", ix, Instant::now().duration_since(start).as_millis());
                                    let before = Instant::now();
                                    loop {
                                        let mut fs = fs_mutex.lock().unwrap();
                                        if fs.len() == 0 {
                                            println!("#{}: FS ist leer. Beende Thread.", ix);
                                            drop(fs);
                                            break;
                                        } else {
                                            println!("#{}: Neue Berechnung. [{}]", ix, Instant::now().duration_since(start).as_millis());
                                            let s = fs.remove(0);
                                            drop(fs);
                                            let before = Instant::now();
                                            thread_db.calc(&s, &p, false);
                                            println!("#{}: {} in {}ms berechnet. [{}]", ix, s.write(), Instant::now().duration_since(before).as_millis(), Instant::now().duration_since(start).as_millis());
                                        }
                                    }
                                    println!("#{}: Ende nach {}ms. [{}]", ix, Instant::now().duration_since(before).as_millis(), Instant::now().duration_since(start).as_millis());
                                    return thread_db;
                                }));
                            }
                            println!("Alle Threads gestartet. [{}]", Instant::now().duration_since(start).as_millis());

                            for ix in 0..handles.len() {
                                println!("Warte auf Thread #{}. [{}]", ix, Instant::now().duration_since(start).as_millis());
                                root_db.import(handles.remove(0).join().unwrap());
                            }
                            println!("Alle Threads sind fertig. [{}]", Instant::now().duration_since(start).as_millis());
                            root_db.calc(&pos, &p, false).t
                        }
                    }
                }
            }
        };

        root_db.set(Pos::from(&pos.write()), &p, &t);

        CalcResult {
            pos: pos.write(),
            p: p.c(),
            t,
            entries: root_db.len() - old_len,
            times: root_db.times
        }
    }

    pub struct CalcResult {
        pub pos: String,
        pub p: char,
        pub t: H::Togre,
        pub entries: usize,
        pub times: (i64, i64, i64),
    }

}

#[allow(non_snake_case)]
pub mod HK {
    use super::H::{ Pos, Player };

    /// Allgemeines Set mit Stellungen für beide Player.
    pub struct Set { pub x: Vec<Pos>, pub o: Vec<Pos>}
    impl Set {
        
        /// Erstellt ein leeres Set.
        pub fn new() -> Set { Set { x: vec![], o: vec![] } }
        
        /// Erstellt ein neues Set aus einem kodierten String.
        pub fn from(code: String) -> Set {
            let mut s = Set::new();
            let parts = code.split("#").map(|s| s.to_string()).collect::<Vec<String>>();
            s.x.append(&mut Pos::collection_from(parts[0].clone()));
            s.o.append(&mut Pos::collection_from(parts[1].clone()));
            s
        }
        
        /// Kodiert das `Set` in einen `String`, wobei X und O durch `#` getrennt werden.
        pub fn write(&self) -> String {
            Pos::write_collection(&self.x) + "#" + &Pos::write_collection(&self.o)
        }
        
        /// Prüft, ob `pos` mit dem Player `p` im Set enthalten ist.
        pub fn has(&self, pos: &Pos, p: &Player) -> bool {
            (if p == &Player::X { &self.x } else { &self.o }).contains(pos)
        }
        
        /// Fügt `pos` mit Player `p` zum Set hinzu, wenn nicht schon enthalten. Der Return-Wert gibt an, ob ein neuer Wert hinzugefügt wurde.
        pub fn add(&mut self, pos: Pos, p: &Player) -> bool {
            let v = if p == &Player::X { &mut self.x } else { &mut self.o };
            if v.contains(&pos) { false } else { v.push(pos); true }
        }
        
        /// Gibt die Gesamtanzahl aller Einträge aus.
        pub fn len(&self) -> usize {
            self.x.len() + self.o.len()
        }
        
        /// Fügt alle Elemente von `other` in dieses Set hinzu
        pub fn import(&mut self, other: Set) -> &mut Self {
            for element in other.x { self.add(element, &Player::X); }
            for element in other.o { self.add(element, &Player::O); }
            self
        }
        
        /// Entfernt ein (zufälliges) Element aus dem Set und gibt Some(Element), wenn keines mehr enthalten ist, None zurück.
        pub fn drop_one(&mut self) -> Option<(Pos, Player)> {
            if self.x.len() > 0 {
                Some((self.x.swap_remove(0), Player::X))
            }
            else if self.o.len() > 0 {
                Some((self.o.swap_remove(0), Player::O))
            }
            else { None }
        }
        
        /// Entfernt bis zu `count` Elemente (zufällig) aus diesem Set und gibt sie als separates Set zurück.
        pub fn seperate(&mut self, count: i32) -> Set {
            let mut n = Set::new();
            for _ in 0..(count / 2) {
                if self.x.len() > 0 { n.add(self.x.swap_remove(0), &Player::X); }
                else if self.o.len() > 0 { n.add(self.o.swap_remove(0), &Player::O); }
                else { break; };
            }
            n
        }
        
    }
    
    pub struct Halbkreis {
        pub c: Set,
        pub arms: Set,
        compl: usize,
        start_pos: Pos,
        start_player: Player
    }
    impl Halbkreis {
        /// Dekodiert einen `Halbkreis` aus dem gegeben `code` (Gegenstück zu `write`).
        pub fn from(code: String) -> Halbkreis {
            // Die ersten drei Angaben sind fiktiv. Da ich kein System habe, um aus einem String-Kodierten HK diese Angaben zu extrahieren, habe ich die entsprechenden Felder im struct als private markiert und die Angaben unten gefaket.
            Halbkreis { compl: 8, start_pos: Pos::from("-"), start_player: Player::X, arms: Set::new(), c: Set::from(code.split("%%").collect::<Vec<&str>>()[1].to_string())}
        }
        
        /// Kodiert den `Halbkreis` in einen `String`.
        pub fn write(&self, remarks: String) -> String {
            format!("Rusty-Togre Halbkreis: {}/{:?} (compl: {}) im Format X#O\nRemarks: {}\n%%{}", self.start_pos.write(), self.start_player, self.compl, remarks, self.c.write())
        }

        /// Generiert einen neuen `Halbkreis` bei der Komplexität `compl` von der `start_stellung` mit dem `start_player` aus und gibt diesen zurück.
        pub fn gener(start_pos: Pos, start_player: &Player, compl: usize) -> Halbkreis {
            let mut h = Halbkreis { c: Set::new(), arms: Set::new(), compl, start_pos, start_player: *start_player};
            h.i(h.start_pos.clone(), start_player);
            h
        }
        
        /// ***Nur für internen Gebrauch:*** Rekursive Kernfunktion zur Halbkreis-Generation.
        fn i(&mut self, pos: Pos, p: &Player) {
            // Ist pos Teil des Halbkreises? Dann abspeichern.
            if pos.compl() == self.compl {
                self.c.add(pos, p);
            // sonst: wurde pos schon als Arm berechnet? Wenn nein:
            } else if ! self.arms.has(&pos, p) {
                // Über Folgestellungen iterieren und berechnen
                for fs in pos.folgestellungen(p) {
                    self.i(fs, &p.not());
                }
                self.arms.add(pos, p);
            };
        }
        
    }

    pub struct Halbkreis2 {
        pub c: Set,
        pub arms: Set,
        tiefe: usize,
        start_pos: Pos,
        start_player: Player
    }
    impl Halbkreis2 {
        /// Dekodiert einen `Halbkreis` aus dem gegeben `code` (Gegenstück zu `write`).
        pub fn from(code: String) -> Halbkreis2 {
            // Die ersten drei Angaben sind fiktiv. Da ich kein System habe, um aus einem String-Kodierten HK diese Angaben zu extrahieren, habe ich die entsprechenden Felder im struct als private markiert und die Angaben unten gefaket.
            Halbkreis2 { tiefe: 8, start_pos: Pos::from("-"), start_player: Player::X, arms: Set::new(), c: Set::from(code.split("%%").collect::<Vec<&str>>()[1].to_string())}
        }
        
        /// Kodiert den `Halbkreis` in einen `String`.
        pub fn write(&self, remarks: String) -> String {
            format!("Rusty-Togre Halbkreis: {}/{:?} (tiefe: {}) im Format X#O\nRemarks: {}\n%%{}", self.start_pos.write(), self.start_player, self.tiefe, remarks, self.c.write())
        }

        /// Generiert einen neuen `Halbkreis` bei der Komplexität `compl` von der `start_stellung` mit dem `start_player` aus und gibt diesen zurück.
        pub fn gener(start_pos: Pos, start_player: &Player, tiefe: usize) -> Halbkreis2 {
            let mut h = Halbkreis2 { c: Set::new(), arms: Set::new(), tiefe, start_pos, start_player: *start_player};
            h.i(h.start_pos.clone(), start_player, tiefe);
            h
        }
        
        /// ***Nur für internen Gebrauch:*** Rekursive Kernfunktion zur Halbkreis-Generation.
        fn i(&mut self, pos: Pos, p: &Player, tiefe: usize) {
            // Ist pos Teil des Halbkreises? Dann abspeichern.
            if tiefe == 0 {
                self.c.add(pos, p);
            // sonst: wurde pos schon als Arm berechnet? Wenn nein:
            } else if ! self.arms.has(&pos, p) {
                // Über Folgestellungen iterieren und berechnen
                for fs in pos.folgestellungen(p) {
                    self.i(fs, &p.not(), tiefe - 1);
                }
                self.arms.add(pos, p);
            };
        }
        
        pub fn len(&self) -> usize {
            self.c.len()
        }

    }

    pub fn tool (args: &mut Vec<&str>) {
        // rusty-togre hk -w out.hkdb ef.kl X 8
        let mut write = false;
        let mut file = String::from("");
        if args[1] == "-w" {
            write = true;
            file = args[2].to_string();
            args.remove(0);
            args.remove(0);
        }
        let (pos, player, compl) = (
            Pos::from(args[1]),
            match args[2] {"X" => &Player::X, "O" => &Player::O, _ => panic!("Invalid Player Code: {}.", args[2])},
            args[3].to_string().parse::<usize>().expect(&format!("Invalid complexity threshold: {}", args[3]))
        );
        println!("Halbkreis mit Komplexität {} wird für {}/{:?} berechnet.", compl, pos.write(), player);
        let hk = Halbkreis::gener(pos, player, compl);
        println!("Halbkreis-Berechnung abgeschlossen nach {}ms abgeschlossen. {} Elemente enthalten, {} bekannte Arme.", "?", hk.c.len(), hk.arms.len());
        if write { std::fs::write(file, hk.write(format!("Berechnet.").to_string())).expect("Halbkreis konnte nicht gesichert werden."); }
    }
}

#[allow(non_snake_case)]
pub mod Auto {
    use std::convert::TryInto;

    use super::H::*;
    use super::T;
    const BTRS_TIEFE: u8 = 4;
    pub fn answer(pos: Pos, p: &Player) -> Pos {
        let mut options = pos.folgestellungen(p);
        let mut best_ix = (0, i(&options[0], &p.not(), BTRS_TIEFE));
        for ix in 1..options.len() {
            let s = i(&options[ix], &p.not(), BTRS_TIEFE);
            if (p == &Player::X && s > best_ix.1) || (p == &Player::O && s < best_ix.1) {
                best_ix = (ix, s);
            }
        }
        options.remove(best_ix.0)
    }
    fn score(pos: &Pos) -> i8 { (pos.0.len() - pos.1.len()).try_into().unwrap() }

    fn i(pos: &Pos, p: &Player, tiefe: u8) -> i8 {
        // Vor dem rekursiven Aufruf wird immer geprüft, ob `pos` syntaktisch gewonnen/verloren ist. Daher muss hier nur noch Remis geprüft werden.
        // ACHTUNG: Beim externen Aufruf immer syntaktische, nicht-neutrale Finalität prüfen!
        let mut db = T::DB::new();
        // `pos` ist nicht final gewonnen.
        // Wenn das Tiefenlimit noch nicht erreicht ist, berechnen wir den Score rekursiv.
        if tiefe != 0 {
            // Dazu ermitteln wir die Scores der Folgestellungen und speichern sie hier:
            let mut scores: Vec<i8> = vec![]; // …um am Ende den besten zurückzugeben.
            // Wir rechnen in zwei Stufen. Stellungen, die aufgeschoben werden, werden hier gespeichert.
            let mut later: Vec<Pos> = vec![];

            // Wir iterieren zunächst über die möglichen Startfelder.
            for startfeld in pos.of(p) {
                // Für jedes Startfeld iterieren wir über die vier Zielfeld-Optionen.
                for zielfeld_option in pos.zielfelder(*startfeld, p, true) {
                    // Wenn das Zielfeld infrage kommt, man also darauf ziehen kann…
                    if let Some(zielfeld) = zielfeld_option {
                        // …erzeugen wir zunächst die resultierende Stellung.
                        let newpos = pos.zug_anwenden(*startfeld, zielfeld, p);
                        // Wir prüfen, ob der Score bereits gespeichert ist:
                        let score: Option<i8> = match db.get_by_score(&newpos, &p.not()) {
                            Some(saved) => Some(saved),
                            None => {
                                // Wenn nicht, prüfen wir, ob newpos final ist.
                                match newpos.won() {
                                    Some(won) => Some(won.score()),
                                    // Wenn nicht, wird zunächst None gesichert.
                                    None => None
                                }
                            }
                        };
                        // Hat die Prüfung oben etwas ergeben?
                        if let Some(s) = score {
                            // Wenn `newpos` togre-positiv ist, wird die Berechnung abgrebrochen - die beste Option ist gefunden!
                            if s == p.score() { return s; }
                            // Sonst wird der bekannte Score einfach protokolliert.
                            else { scores.push(s); }
                        }
                        // Wenn die Prüfung nichts ergeben hat, muss newpos später berechnet werden.
                        else { later.push(newpos); }
                    }
                }
            }
            for late in later {
                // Wir errechnen den Score dieser Folgestellung.
                let score: i8 = i(&late, &p.not(), tiefe - 1);
                db.set_by_score(late, &p.not(), score);
                if score == p.score() { return score; }
                else { scores.push(score); }
            }
            // Wenn keine Scores gespeichert wurden, gibt es offenbar keine Folgestellungen. `pos` ist also final remis.
            if scores.len() == 0 { return 0; }
            // Sonst muss der beste gespeicherte Score returned werden.
            else {
                // Wir gehen erstmal vom Schlechtesten aus…
                let mut best = p.not().score();
                // …und korrigieren den Wert dann sukzessive.
                if p.is_x() { for score in scores { best = score.max(best) } }
                else { for score in scores { best = score.min(best) } }
                return best;
            }
        }
        // Wenn das Tiefenlimit erreicht ist, wird der Score kriterial berechnet.
        else {
            // Wenn die Stellung zu komplex ist, wird sie kriterial beurteilt.
            if pos.compl() > 6 {
                return score(pos);
            }
            // Sonst einfach weiterrechnen, aber ohne Tiefenlimit.
            else {
                return i(pos, p, 100);
            }
        }
    }
}

#[allow(non_snake_case)]
pub mod BTRS {
    use std::collections::HashMap;
    use super::H::*;

    pub type Score = i8;
    type Compl = u8;
    pub const SCORE_FINAL: Score = 13;

    pub struct CalcResult {
        pub pos: String,
        pub p: String,
        pub score: Score,
        pub entries: usize
    }

    pub struct DB {
        x: HashMap<Pos, (Score, u8, Compl)>,
        o: HashMap<Pos, (Score, u8, Compl)>
    }
    impl DB {
     
        /// Erstellt eine neue, leere `DB`.
        pub fn new() -> DB { DB { x: HashMap::new(), o: HashMap::new() } }
      
        /// Gibt die Gesamtzahl aller Einträge aus.
        pub fn len(&self) -> usize {
            self.x.len() + self.o.len()
        }
       
        /// Gibt `Some(score)` zurück, wenn ein Eintrag mit derselben oder einer höheren Tiefe und demselben oder einem höheren compl-Grenzwert besteht.
        pub fn get(&self, pos: &Pos, p: &Player, tiefe: u8, compl: Compl) -> Option<Score> {
            if let Some(entry) = (if *p == Player::X { &self.x } else { &self.o }).get(&pos) {
                if entry.1 >= tiefe && entry.2 >= compl { Some(entry.0) } else { None }
            } else { None }
        }
       
        /**
        Setzt einen neuen Eintrag in der DB.

        Besteht bereits ein Eintrag mit niedrigerer Tiefe oder niedrigerem compl-Grenzwert, wird dieser überschrieben.

        `panic!()`, wenn ein Eintrag mit derselben Tiefe und demselben compl-Grenzwert, aber einem anderen Score existiert. 
        */
        pub fn set(&mut self, pos: Pos, p: &Player, score: Score, tiefe: u8, compl: Compl) {
            let map = if p.is_x() { &mut self.x } else { &mut self.o };
            // Wenn schon ein Eintrag hierfür besteht…
            if let Some(existing) = map.get(&pos) {
                // Bei identischen Parametern und verschiedenen Scores: panic!
                if existing.1 == tiefe && existing.2 == compl && existing.0 != score {
                    panic!("BTRS.DB.set: Die Set-Anfrage {}/{}={} (tiefe={}, compl={}) wiederspricht einem bereits existierenden Eintrag mit gleicher Tiefe und gleichem compl: {}.", pos.write(), p.c(), score, tiefe, compl, existing.0);
                }
                // Bei kleinerer Tiefe ODER kleinerem compl: überschreiben.
                else if existing.1 < tiefe || existing.2 < compl {
                    map.insert(pos, (score, tiefe, compl));
                }
                // Sonst: Alter Eintrag kann behalten werden.
            }
            // Wenn nicht: Neuer Eintrag.
        }
   
    }

    /// Gibt die Folgestellung von `pos` mit dem für `p` besten BTRS-Score zurück.
    pub fn answer(db: &mut DB, pos: Pos, p: &Player, tiefe: u8, compl_limit: Compl) -> Pos {
        match pos.won() {
            Some(_) => pos,
            None => {
                let mut options = pos.folgestellungen(p);
                if options.len() == 0 { pos } else {
                    let mut best = (0, p.not().score());
                    for ix in 0..options.len() {
                        if best.1 == p.score() { break; }
                        let s = match db.get(&options[ix], &p.not(), tiefe - 1, compl_limit) {
                            Some(saved) => saved,
                            None => i(db, &options[ix], &p.not(), tiefe, compl_limit)
                        };
                        if (p == &Player::X && s > best.1) || (p == &Player::O && s < best.1) {
                            best = (ix, s);
                        }
                    }
                    options.remove(best.0)
                }
            }
        }
    }

    /// Berechnet den BTRS-Score von `pos` mit gegebenen Tiefen- und Compl-Limits.
    pub fn calc(db: &mut DB, pos: &Pos, p: &Player, tiefe: u8, compl_limit: Compl) -> Score {
        if let Some(won) = pos.won() { won.score() }
        else if let Some(score) = db.get(pos, p, tiefe, compl_limit) { score }
        else { i(db, pos, p, tiefe, compl_limit)}
    }
    
    /// Rekursive BTRS-Funktion.
    /// 
    /// **ACHTUNG**: Vor dem Aufruf ***immer*** `pos` auf syntaktische, nicht-neutrale Finalität (`.won()`) prüfen. `i` prüft nur syntaktisch *Remis*.
    /// 
    /// **ACHTUNG**: Vor dem Aufruf ***immer*** prüfen, ob `pos` schon gespeichert ist. `i` sucht in der DB nur nach den Folgestellungen von `pos`. Daher kleine Performance-Verbesserung möglich.
    fn i(db: &mut DB, pos: &Pos, p: &Player, tiefe: u8, compl_limit: Compl) -> Score {
        // `pos` ist nicht final gewonnen (siehe Doc).

        // Wenn das Tiefenlimit noch nicht erreicht ist, berechnen wir den Score rekursiv.
        if tiefe != 0 {
            // Dazu ermitteln wir die Scores der Folgestellungen und speichern sie hier:
            let mut scores: Vec<i8> = vec![]; // …um am Ende den besten zurückzugeben.
            // Wir rechnen in zwei Stufen. Stellungen, die aufgeschoben werden, werden hier gespeichert.
            let mut later: Vec<Pos> = vec![];

            // Wir iterieren zunächst über die möglichen Startfelder.
            for startfeld in pos.of(p) {
                // Für jedes Startfeld iterieren wir über die vier Zielfeld-Optionen.
                for zielfeld_option in pos.zielfelder(*startfeld, p, true) {
                    // Wenn das Zielfeld infrage kommt, man also darauf ziehen kann…
                    if let Some(zielfeld) = zielfeld_option {
                        // …erzeugen wir zunächst die resultierende Stellung.
                        let newpos = pos.zug_anwenden(*startfeld, zielfeld, p);
                        // Wir prüfen, ob der Score bereits gespeichert ist:
                        let score: Option<Score> = match db.get(&newpos, &p.not(), tiefe - 1, compl_limit) {
                            Some(saved) => Some(saved),
                            None => {
                                // Wenn nicht, prüfen wir, ob newpos final ist.
                                match newpos.won() {
                                    Some(won) => Some(won.score()),
                                    // Wenn nicht, wird zunächst None gesichert.
                                    None => None
                                }
                            }
                        };
                        // Hat die Prüfung oben etwas ergeben?
                        if let Some(s) = score {
                            // Wenn `newpos` togre-positiv ist, wird die Berechnung abgrebrochen - die beste Option ist gefunden!
                            if s == p.score() { return s; }
                            // Sonst wird der bekannte Score einfach protokolliert.
                            else { scores.push(s); }
                        }
                        // Wenn die Prüfung nichts ergeben hat, muss newpos später berechnet werden.
                        else { later.push(newpos); }
                    }
                }
            }
           
            // Jetzt haben wir alle möglichen Folgestellungen ein erstes Mal inspiziert.
                // Waren sie gewonnen/verloren oder der Score bereits in der DB, so finden wir diesen in `scores`.
                // Wenn nicht, so wurden sie in `later` gespeichert und werden nun eine nach der anderen berechnet.
            for late in later {
                // Wir errechnen den Score dieser Folgestellung.
                let score: i8 = i(db, &late, &p.not(), tiefe - 1, compl_limit);
                db.set(late, &p.not(), score, tiefe - 1, compl_limit);
                if score == p.score() { return score; }
                else { scores.push(score); }
            }

            // Nun wurde jede Folgestellung abschließend inspiziert. Wenn keine Scores gespeichert wurden, gibt es offenbar keine Folgestellungen. `pos` ist also final remis.
            if scores.len() == 0 { return 0; }
            // Sonst muss der beste gespeicherte Score returned werden.
            else {
                // Wir gehen erstmal vom Schlechtesten aus…
                let mut best = p.not().score();
                // …und korrigieren den Wert dann sukzessive hoch.
                if p.is_x() { for score in scores { best = score.max(best) } }
                else { for score in scores { best = score.min(best) } }
                return best;
            }
        }
        
        // Wenn das Tiefenlimit erreicht ist, wird der Score kriterial oder ausschöpfend (quasi-TOGRE) berechnet.
        else {
            // Wenn die Stellung zu komplex ist, wird sie kriterial beurteilt.
            if compl(pos) > compl_limit {
                return crit_score(pos);
            }
            // Sonst einfach weiterrechnen, aber ohne Tiefenlimit.
            else {
                return i(db, pos, p, 100, compl_limit);
            }
        }
    }

    /// Gibt die Komplexität von `pos` für die BTRS-Berechnung zurück.
    fn compl(pos: &Pos) -> Compl {
        pos.compl() as Compl
    }
    fn crit_score(pos: &Pos) -> Score {
        (pos.0.len() - pos.1.len()) as i8
        // match (pos.0.len() - pos.1.len()).try_into<>() {
        //     Ok(_) => todo!(),
        //     Err(_) => todo!(),
        // }
    }

    // pub struct Calculator {
    //     pub tiefenlimit: u8,
    //     pub compl_limit: Compl,
    //     db: DB
    // }
    // impl Calculator {
    //     pub fn new(tiefenlimit: u8, compl_limit: Compl) -> Calculator {
    //         Calculator { tiefenlimit, compl_limit, db: DB::new() }
    //     }
    //     pub fn calc(&mut self, pos: &Pos, p: &Player) -> Score {
    //         calc(&mut self.db, pos, p, self.tiefenlimit, self.compl_limit)
    //     }
    //     pub fn answer(&mut self, pos: Pos, p: &Player) -> Pos {
    //         answer(&mut self.db, pos, p, self.tiefenlimit, self.compl_limit)
    //     }
    // }



}