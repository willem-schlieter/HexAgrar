/*
*/

pub const INFO: &str = "Abwandlung Nr. 3 / 27.5.22: Stellungen werden jetzt doch nicht mehr als Matrizen, Felder aber nach wie vor als 2-Tuple repräsentiert. Bringt gar nichts!";

#[allow(non_snake_case)]
pub mod H {
    type Feld = (i8, i8);
    const FIELDS: [char; 36] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

    #[derive(Debug, PartialEq, Eq, Hash, Clone)]
    pub struct Pos ( pub Vec<Feld>, pub Vec<Feld> );
    impl Pos {
        /// Kodiert eine Collection (`Vec<Pos>`) zu einem `String`, wobei die Stellungen durch ein `/` getrennt werden.
        pub fn write_collection(collection: &Vec<Pos>) -> String {
            collection.iter().map(|p| p.write()).collect::<Vec<String>>().join("/")
        }
        /// Dekodiert eine Collection aus einem kodierten `String` (Gegenstück zu `write_collection`).
        pub fn collection_from(code: String) -> Vec<Pos> {
            code.split("/").map(|c| Pos::from(c.to_string())).collect()
        }
        
        /// Erstellt den Kern einer leeren Stellung.
        // pub fn new_c() -> [[Option<bool>; 6]; 6] {
        //     [[None, None, None, None, None, None], [None, None, None, None, None, None], [None, None, None, None, None, None], [None, None, None, None, None, None], [None, None, None, None, None, None], [None, None, None, None, None, None]]
        // }
        /// Erstellt eine leere Stellung.
        pub fn new() -> Pos { Pos (vec![], vec![]) }
        /// Kopiert die Stellung
        pub fn deep_copy(&self) -> Pos {
            Pos (self.0.iter().map(|feld| feld.clone()).collect(), self.1.iter().map(|feld| feld.clone()).collect())
        }
        /// Erstellt eine Stellung aus einem gegebenen Code.
        pub fn from(code: String) -> Pos {
            if code == "-" { return Pos::from("012345.uvwxyz".to_string()) }
            let mut parts = code.split(".").collect::<Vec<&str>>();
            while parts.len() < 2 { parts.push("") };
            if parts.len() > 2 { panic!("Stellungscode {} ungültig.", code) }

            let (mut x, mut o) = (vec![], vec![]);
            for ch in parts[0].chars() {
                x.push(Pos::c2k(ch));
            }
            for ch in parts[1].chars() {
                o.push(Pos::c2k(ch));
            }
            Pos ( x, o )
        }
        /// Gibt den Code der Stellung aus.
        pub fn write(&self) -> String {
            let mut r = String::new();
            for f in self.of(&Player::X).iter() { r.push(Pos::k2c(*f)); }
            r.push('.');
            for f in self.of(&Player::O).iter() { r.push(Pos::k2c(*f)); }
            r
        }
        /// Koordinaten in Feldnummer konvertieren
        pub fn k2f(k: Feld) -> i8 {
            6 * k.1 + k.0
        }
        /// Feldchar in Koordinaten konvertieren
        pub fn c2k(c: char) -> Feld {
            match FIELDS.into_iter().position(|e| e == c) {
                Some(f) => ((f as i8 % 6), ((f as i8 - (f as i8 % 6)) / 6)),
                None => panic!("Feldchar {} ungültig.", c)
            }
        }
        /// Koordinaten in Feldchar konvertieren
        pub fn k2c(k: Feld) -> char {
            FIELDS[(6 * k.1 + k.0) as usize]
        }
        /// Gibt eine & zum Vec<Feld> des angegebenen Players zurück.
        pub fn of(&self, player: &Player) -> &Vec<Feld> {
            if player.b() { &self.0 } else { &self.1 }
        }
        /// Gibt eine &mut zum Vec<Feld> des angegebenen Players zurück.
        pub fn of_mut(&mut self, player: &Player) -> &mut Vec<Feld> {
            if player.b() { &mut self.0 } else { &mut self.1 }
        }
        /// Gibt zurück, ob ein Spieler gewonnen hat, sonst None.
        pub fn won(&self) -> Option<Player> {
            let mut p = None;
            self.of(&Player::X).into_iter().for_each(|feld| if self.row_for(*feld, &Player::X) == 5 { p = Some(Player::X); });
            self.of(&Player::O).into_iter().for_each(|feld| if self.row_for(*feld, &Player::O) == 5 { p = Some(Player::O); });
            p
        }
        /// Gibt an, in welcher Reihe das gegebene Feld für den gegebenen Player ist.
        pub fn row_for(&self, feld: Feld, player: &Player) -> i8 {
            if *player == Player::X {
                feld.1
            } else {
                5 - feld.1
            }
        }
        /// Berechnet die Komplexität der Stellung, also die Anzahl der Figuren, die sich im Heimbereich befinden.
        pub fn compl(&self) -> usize {
            self.of(&Player::X).iter().filter(|feld| self.row_for(**feld, &Player::X) < 2).collect::<Vec<&(i8, i8)>>().len() + self.of(&Player::O).iter().filter(|feld| self.row_for(**feld, &Player::O) < 2).collect::<Vec<&(i8, i8)>>().len()
            // let mut com: usize = 0;
            // for y in 0..2 { for x in 0..6 { if self.c[y as usize][x as usize] == Some(true) {com += 1} } }
            // for y in 4..6 { for x in 0..6 { if self.c[y as usize][x as usize] == Some(false) {com += 1} } }
            // com
        }
        // Ermittelt alle möglichen Zielfelder, die ein Spieler von einem Feld aus in dieser Pos erreichen kann.
        pub fn zielfelder(&self, feld: Feld, p: &Player) -> [Option<Feld>; 4] {
            // Steht der angegebene Spieler überhaupt auf dem Feld?
            // Nur für dev, später uU löschen (wegen perf)
            if ! self.of(p).contains(&feld) { panic!("In der Pos {:?} steht der Player {:?} nicht auf dem Feld {:?}.", self, p, feld) }
            else {
                // Letzte Reihe? Dann nichts.
                let mut res: [Option<Feld>; 4] = [None, None, None, None];
                if self.row_for(feld, &p) == 5 { res }
                else {
                    let ziele: (Feld, Feld, Feld, Feld) = (
                        // 1 Schritt
                        (feld.0, (feld.1 + p.m())),
                        // 2 Schritt
                        (feld.0, (feld.1 + p.m() * 2)),
                        // Linker Schlag
                        (feld.0 - 1, (feld.1 + p.m())),
                        // Rechter Schlag
                        (feld.0 + 1, (feld.1 + p.m())),
                    );
                    // if ziele.1.1 > 5 || ziele.1.1 < 0 { panic!("Ziele.1 ({}) ist ungültig. Setting: {:?}, {:?}", ziele.1.1, feld, p) }
                    // Wenn das Feld vor mir frei ist…
                    if ! (self.0.contains(&ziele.0) || self.1.contains(&ziele.0)) {
                        // …kann ich einen Schritt machen.
                        res[0] = Some(ziele.0);
                        // Wenn das Feld davor auch frei ist, und ich in der Initialreihe stehe…
                        if self.row_for(ziele.1, p) = 0 && ! (self.0.contains(&ziele.1) || self.1.contains(&ziele.1)) {
                            // …dann kann ich auch zwei Schritte machen.
                            res[1] = Some(ziele.1);
                        }
                    }
                    // Linker Schlag: Wenn ich nicht schon ganz links stehe, und außerdem auf dem Zielfeld der Gegner steht…
                    if ziele.2.0 > -1 && self.of(&p.not()).contains(&ziele.2) {
                        // …kann ich schlagen.
                        res[2] = Some(ziele.2);
                    }
                    // Rechter Schlag: Wenn ich nicht schon ganz rechts stehe, und außerdem auf dem Zielfeld der Gegner steht…
                    if ziele.3.0 < 6 && self.of(&p.not()).contains(&ziele.3) {
                        // …kann ich schlagen.
                        res[3] = Some(ziele.3);
                    }
                    res
                }
            }
        }
        // Wendet einen Zug auf self an und gibt die resultierende Stellung zurück.
        pub fn zug_anwenden(&self, zug: Zug, p: &Player) -> Pos {
            let mut n = self.deep_copy();
            // zug.from entfernen
            match n.of(&p).iter().position(|f| *f == zug.from) {
                Some(i) => n.of_mut(&p).remove(i),
                None => panic!("Spieler {:?} steht in Pos {:?} nicht auf Feld {:?}.", p, self, zug.from)
            };
            // zug.to bei Ziehendem hinzufügen
            {
                let m = n.of_mut(&p);
                if m.len() == 0 || Pos::k2f(m[m.len() - 1]) < Pos::k2f(zug.to) { m.push(zug.to) }
                else {
                    for i in 0..m.len() {
                        if m[i] == zug.to { break; }
                        else if Pos::k2f(m[i]) > Pos::k2f(zug.to) { m.insert(i, zug.to); break; }
                    }
                }
            }
            // zug.to bei Anderem entfernen
            if let Some(i) = n.of(&p.not()).iter().position(|f| *f == zug.to) {
                n.of_mut(&p.not()).remove(i);
            };
            n
        }
        // Gibt einen Vector mit allen möglichen Folgestellungen zurück.
        pub fn folgestellungen(&self, p: &Player) -> Vec<Pos> {
            let mut res: Vec<Pos> = vec![];
            for startfeld in self.of(p) {
                for zielfeld_op in self.zielfelder(*startfeld, p) {
                    if let Some(zielfeld) = zielfeld_op {
                        res.push(self.zug_anwenden(Zug {from: *startfeld, to: zielfeld}, p));
                    }
                }
            };
            res
        }
    }

    pub struct Zug { pub from: Feld, pub to: Feld }

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
        pub fn b(&self) -> bool {
            self == &Player::X
        }
    }

    #[derive(PartialEq, Debug, Copy, Clone)]
    pub enum Togre { X, O, R }
    impl Togre {
    // fn not(&self) -> Togre {
    //     match self {
    //         Togre::X => Togre::O,
    //         Togre::O => Togre::X,
    //         Togre::R => Togre::R
    //     }
    // }
    }
}

#[allow(non_snake_case)]
pub mod T {
    extern crate termion;
    use termion::{color, style};
    use std::{collections::HashMap, time::Instant};
    use super::H;
    use H::{ Togre, Pos };
    pub struct DB {
        x: HashMap<H::Pos, H::Togre>,
        o: HashMap<H::Pos, H::Togre>,
        times: (i64, i64, i64) // i, get, set
    }
    impl DB {
        /// Erstellt eine neue, leere `DB`.
        pub fn new() -> DB { DB { x: HashMap::new(), o: HashMap::new(), times: (0, 0, 0) } }
        /// Dekodiert eine `DB` aus einem kodierten `String` (Gegenstück zu `write`).
        pub fn from(code: String) -> DB {
            let mut db = DB::new();
            let parts = code.split("%%").collect::<Vec<&str>>()[1].to_string().split("#").map(|s| s.to_string()).collect::<Vec<String>>().iter().map(|part| part.split("/").map(|c| Pos::from(c.to_string())).collect::<Vec<Pos>>()).collect::<Vec<Vec<Pos>>>();
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
            match (if *p == H::Player::X { &self.x } else { &self.o }).get(&pos) {
                Some(t) => Some(*t),
                None => None
            }
        }
        /// Setzt `pos`/`p` auf Togre `t`.
        pub fn set(&mut self, pos: H::Pos, p: &H::Player, t: &H::Togre) {
            self.times.2 += 1;
            (if *p == H::Player::X { &mut self.x } else { &mut self.o }).insert(pos, *t);
        }
        /// Berechnet die `Togre`-Zahl für `pos_code`/`player_code` und gibt ein `CalcResult` zurück.
        pub fn calc(&mut self, pos_code: String, player_code: &str) -> CalcResult {
            let pos = H::Pos::from(pos_code);
            let p = match player_code {
                "X" | "x" => H::Player::X,
                "O" | "o" => H::Player::O,
                _ => panic!("Invalid player code: {}", player_code)
            };
            let old_len = self.len();
            let time_before = Instant::now();

            let t = match pos.won() {
                Some(p) => p.togre(),
                None => {
                    match self.get(&pos, &p) {
                        Some(t) => t,
                        None => {
                            self.i(&pos, &p)
                        }
                    }
                }
            };
            CalcResult {
                pos: pos.write(),
                p: p.c(),
                t,
                entries: self.len() - old_len,
                times: self.times,
                duration: Instant::now().duration_since(time_before).as_millis()
            }
        }
        /// ***Nur für internen Gebrauch:*** Rekursive Kernfunktion zur Togre-Berechnung.
        fn i(&mut self, pos: &H::Pos, p: &H::Player) -> H::Togre {
            self.times.0 += 1;
            // pos ist garantiert nicht gewonnen und nicht in der DB. (Denn bei rekursivem Aufruf wurde dies schon vorher geprüft, s.u., und der manuelle Aufruf sollte über calc erfolgen, wo dies auch geschieht, s.o.)
            
            let mut is_remis = true;    // pos ist final remis.
            let mut is_r = false;       // pos ist Togre-neutral.
            let mut later: Vec<Pos> = vec![]; // Später berechnen.

            // Über mögliche Startfelder iterieren.
            for startfeld in pos.of(p) {
                // Über Zielfeldoptionen vom Startfeld aus iterieren…
                for zielfeld_op in pos.zielfelder(*startfeld, p) {
                    // …und für tatsächlich mögliche Zielfelder…
                    if let Some(zielfeld) = zielfeld_op {
                        // … – wenn es welche gibt, dann ist pos schonmal nicht final remis – …
                        is_remis = false;
                        // …dorthin ziehen und eine neue Stellung konstruieren.
                        let n = pos.zug_anwenden(H::Zug { from: *startfeld, to: zielfeld}, p);
                        // Nun prüfen, ob für diese Folgestellung schon eine Togre-Zahl gespeichert ist:
                        let t: Option<H::Togre> = match self.get(&n, &p.not()) {
                            // Wenn ja, dann t auf diese setzen.
                            Some(saved) => Some(saved),
                            // Wenn nein, dann…
                            None => {
                                // …prüfen, ob die Folgestellung gewonnen ist:
                                match n.won() {
                                    // Wenn ja, dann t auf den Spieler setzen, der gewonnen hat.
                                    Some(won) => Some(won.togre()),
                                    // Wenn nein, dann t = None.
                                    None => None
                                } // Zwischenstand: t ist jetzt Some(Togre), wenn die Folgestellung
                            } // schon berechnet oder gewonnen wurde. Sonst ist es None.
                        };
                        // Wenn t Some(Togre) ist…
                        if let Some(togr) = t {
                            // …und wenn also p gewonnen hat, dann return (Berechnungsabbruch, Short-Circuit)
                            if togr == p.togre() { return togr; }
                            // …wenn hingegen t = Some(R), dann nur is_r = true, und weiter nach positiven Folgestellungen suchen.
                            else if togr == H::Togre::R { is_r = true; }
                        // Wenn hingegen t = None, weil Folgestellung nicht final und noch nie berechnet, dann in later pushen und später berechnen.
                        } else { later.push(n) };
                    } // Zwischenstand: Wenn bereits eine Folgestellung gefunden wurde, die final oder bereits
                } // berechnet positiv war, ist die Funktion i schon durch Short Circuiting abgrebrochen worden.
            } // Wenn hingegen neutrale gefunden wurden, dann is_r == true. Unabhängig davon sind in later diejenigen Folgestellungen, die noch nie berechnet wurden und nicht final sind.
            // Über diese wird jetzt berechnet:
            for late in later {
                // Die Folgestellung wird berechnet…
                let t = self.i(&late, &p.not());
                // …in die DB eingetragen…
                self.set(late, &p.not(), &t);
                // …und wenn sie positiv ist, dann Short-Circuit…
                if t == p.togre() { return t; }
                // …wenn sie hingegen neutral ist, dann is_r = true…
                else if t == H::Togre::R { is_r = true; }
                // und weitere Folgestellungen werden berechnet.
            }
            // Abschluss: Wenn i an diesem Punkt noch läuft, ist p maximal neutral.
            // Neutral ist es, wenn es entweder final Remis ist, weil kein Startfeld gefunden wurde, von dem aus es mögliche Zielfelder gab (is_remis == true)…
            // …oder wenn irgendwann mal eine neutrale Folgestellung gab (is_r == true).
            if is_r || is_remis { H::Togre::R } else { p.not().togre() } // Sonst ist pos negativ.
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
            [
                String::from("Rusty Togre DB saved as string in format x_x x_o x_r o_x o_o o_r. Data follows here: %%"),
                Pos::write_collection(&x_x),
                Pos::write_collection(&x_o),
                Pos::write_collection(&x_r),
                Pos::write_collection(&o_x),
                Pos::write_collection(&o_o),
                Pos::write_collection(&o_r)
            ].join("#")
        }
    }
    // type Writable_DB = HashMap<String, Vec<H::Pos>>;

    pub struct CalcResult {
        pub pos: String,
        pub p: char,
        pub t: H::Togre,
        pub entries: usize,
        times: (i64, i64, i64),
        pub duration: u128
    }
    impl CalcResult {
        pub fn message(&self) -> String {
            format!(
                "Stellung {}{}{}{}{}{} mit Player {}{}{}{}{}{} in {}{} {}ms {}{} berechnet: {}{}  {:?}  {}{}   - {} neue Einträge. Aufruf-Profil: {:?}",
                color::Fg(color::Red),
                style::Bold,
                style::Underline,
                self.pos,
                style::Reset,
                color::Fg(color::Black),

                color::Fg(color::Red),
                style::Bold,
                style::Underline,
                self.p,
                style::Reset,
                color::Fg(color::Black),

                style::Bold,
                color::Bg(color::Yellow),
                self.duration,
                color::Bg(color::Reset),
                style::Reset,

                color::Bg(color::Green),
                style::Bold,
                self.t,
                style::Reset,
                color::Bg(color::Reset),
                self.entries,
                self.times
            )
        }
    }

    pub fn calc_tool (args: &mut Vec<&str>) {
        let mut write = false;
        let mut file = String::from("");
        if args[1] == "-w" {
            write = true;
            file = args[2].to_string();
            args.remove(0);
            args.remove(0);
        }
        let mut db = DB::new();
        let res = db.calc(args[1].to_string(), args[2]);
        println!("{}", res.message());
        if write { std::fs::write(file.clone(), db.write()).expect(format!("Could not be written to {}", file).as_str()); }
    }
}

#[allow(non_snake_case)]
pub mod HK {
    use super::H::{Pos, Player};
    use std::time::Instant;

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
        /// Prüft, ob `pos` mit dem Player `p` im Set enthalten ist.
        pub fn has(&self, pos: &Pos, p: &Player) -> bool {
            (if p == &Player::X { &self.x } else { &self.o }).contains(pos)
        }
        /// Fügt `pos` mit Player `p` zum Set hinzu, wenn nicht schon enthalten. Der Return-Wert gibt an, ob ein neuer Wert hinzugefügt wurde.
        pub fn add(&mut self, pos: Pos, p: &Player) -> bool {
            let v = if p == &Player::X { &mut self.x } else { &mut self.o };
            if v.contains(&pos) { false } else { v.push(pos); true }
        }
        /// Kodiert das `Set` in einen `String`, wobei X und O durch `#` getrennt werden.
        pub fn write(&self) -> String {
            Pos::write_collection(&self.x) + "#" + &Pos::write_collection(&self.o)
        }
        /// Gibt die Gesamtanzahl aller Einträge aus.
        pub fn len(&self) -> usize {
            self.x.len() + self.o.len()
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
            Halbkreis { compl: 8, start_pos: Pos::from("-".to_string()), start_player: Player::X, arms: Set::new(), c: Set::from(code.split("%%").collect::<Vec<&str>>()[1].to_string())}
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
        /// Kodiert den `Halbkreis` in einen `String`.
        pub fn write(&self, remarks: String) -> String {
            format!("Rusty-Togre Halbkreis: {}/{:?} (compl: {}) im Format X#O\nRemarks: {}\n%%{}", self.start_pos.write(), self.start_player, self.compl, remarks, self.c.write())
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
            Pos::from(args[1].to_string()),
            match args[2] {"X" => &Player::X, "O" => &Player::O, _ => panic!("Invalid Player Code: {}.", args[2])},
            args[3].to_string().parse::<usize>().expect(&format!("Invalid complexity threshold: {}", args[3]))
        );
        println!("Halbkreis mit Komplexität {} wird für {}/{:?} berechnet.", compl, pos.write(), player);
        let start_time = Instant::now();
        let hk = Halbkreis::gener(pos, player, compl);
        let ms = Instant::now().duration_since(start_time).as_millis();
        println!("Halbkreis-Berechnung abgeschlossen nach {}ms abgeschlossen. {} Elemente enthalten, {} bekannte Arme.", ms, hk.c.len(), hk.arms.len());
        if write { std::fs::write(file, hk.write(format!("In {}ms berechnet.", {ms}).to_string())).expect("Halbkreis konnte nicht gesichert werden."); }
    }
}