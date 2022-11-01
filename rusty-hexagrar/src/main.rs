pub mod hexagrar;
use hexagrar::*;
use std::time::Instant;

extern crate termion;
use termion::{color, style};

struct Clock {
    start: Instant
}
impl Clock {
    pub fn new() -> Clock { Clock { start: Instant::now() } }
    pub fn since(&self) -> u128 { Instant::now().duration_since(self.start).as_millis() }
    // pub fn reset(&mut self) { self.start = Instant::now(); }
}

// fn emph(text: String) -> String {
//     format!("{}{}{}{}{}",color::Bg(color::Yellow),
//     style::Bold,
//     text,
//     style::Reset,
//     color::Bg(color::Reset))
// }

fn message(res: T::CalcResult, duration: u128) -> String {
    format!(
        "Stellung {}{}{}{}{}{} mit Player {}{}{}{}{}{} in {}{} {}ms {}{} berechnet: {}{}  {:?}  {}{}   - {} neue Einträge. Aufruf-Profil: {:?}",
        color::Fg(color::Red),
        style::Bold,
        style::Underline,
        res.pos,
        style::Reset,
        color::Fg(color::Black),

        color::Fg(color::Red),
        style::Bold,
        style::Underline,
        res.p,
        style::Reset,
        color::Fg(color::Black),

        style::Bold,
        color::Bg(color::Yellow),
        duration,
        color::Bg(color::Reset),
        style::Reset,

        color::Bg(color::Green),
        style::Bold,
        res.t,
        style::Reset,
        color::Bg(color::Reset),
        res.entries,
        res.times
    )
}

fn btrs_message(res: BTRS::CalcResult, duration: u128) -> String {
    format!(
        "Stellung {}{}{}{}{}{} mit Player {}{}{}{}{}{} in {}{} {}ms {}{} berechnet: {}{} {} {}{}   - {} neue Einträge.",
        color::Fg(color::Red),
        style::Bold,
        style::Underline,
        res.pos,
        style::Reset,
        color::Fg(color::Black),

        color::Fg(color::Red),
        style::Bold,
        style::Underline,
        res.p,
        style::Reset,
        color::Fg(color::Black),

        style::Bold,
        color::Bg(color::Yellow),
        duration,
        color::Bg(color::Reset),
        style::Reset,

        color::Bg(color::Green),
        style::Bold,
        res.score,
        style::Reset,
        color::Bg(color::Reset),
        res.entries
    )
}

fn main() {
    let args_old: Vec<String> = std::env::args().collect();
    let mut args: Vec<&str> = args_old.iter().map(|s| &**s).collect();
    while args.len() < 10 { args.push("") };
    args.remove(0);

    match args[0] {
        "test" => {
        }
        "args" => {
            println!("{:?}", args);
        }
        "sep" => {
            println!("{}{}============================================================================ =================================================================={}{}", style::Bold, color::Bg(color::Yellow), color::Bg(color::Reset), style::Reset);
        }
        "calc" => {
            // match args[1] {
            //     "-v2" => { args.remove(0); ha2::T::calc_tool(&mut args) },
            //     "-v3" => { args.remove(0); ha3::T::calc_tool(&mut args) },
            //     "-v1" => { args.remove(0); T::calc_tool(&mut args) },
            //     _ => { T::calc_tool(&mut args) }
            // }
            
            let mut write = false;
            let mut file = String::from("");
            if args[1] == "-w" {
                write = true;
                file = args[2].to_string();
                args.remove(0);
                args.remove(0);
            }
            
            let mut db = T::DB::new();
            db.set(H::Pos::from("8k.l"), &H::Player::O, &H::Togre::X);

            let before = Instant::now();
            let res = db.calc(&H::Pos::from(args[1]), H::Player::from(args[2]), args[3] == "-full");


            println!("{}", message(res, Instant::now().duration_since(before).as_millis()));
            if write { std::fs::write(file.clone(), db.write()).expect(format!("Could not be written to {}", file).as_str()); }
        }
        "btrs" => {
            let clock = Clock::new();

            let mut db = BTRS::DB::new();
            let score = BTRS::calc(
                &mut db,
                &H::Pos::from(args[1]),
                &H::Player::from(args[2]),
                args[3].to_string().parse::<u8>().expect(&format!("Unzulässiges Tiefenlimit: {}", args[3])),
                args[4].to_string().parse::<u8>().expect(&format!("Unzulässiger compl-Grenzwert: {}", args[3]))
            );
            println!("{}", btrs_message(BTRS::CalcResult{
                pos: args[1].to_string(),
                p: args[2].to_string(),
                entries: db.len(),
                score
            }, clock.since()));
        }
        "test_conc" => {
            let before = Instant::now();
            let res = T::calc_conc(&mut T::DB::new(), &H::Pos::from("1234.vwxy"), H::Player::X);
            println!("{}", message(res, Instant::now().duration_since(before).as_millis()));

        }
        "inspect" => {
            let before = Instant::now();
            let mut db = T::DB::from(std::fs::read_to_string(args[1]).expect(&format!("Datei {} konnte nicht gelesen werden.", args[1])));
            println!("DB mit {} Einträgen in {}ms eingelesen.", db.len(), Instant::now().duration_since(before).as_micros() / 1000);
            let mut pos_code;
            let mut p_code = String::from("X");
            let mut keep = false;
            'l: loop {
                println!("Stellung: ");
                pos_code = String::from("");
                std::io::stdin().read_line(&mut pos_code).expect("Input konnte nicht gelesen werden.");
                pos_code.pop();
                if pos_code == "exit" { break 'l; }
                else if pos_code == "unkeep" { continue 'l; }
                if ! keep {
                    println!("Player: ");
                    p_code = String::from("");
                    std::io::stdin().read_line(&mut p_code).expect("Input konnte nicht gelesen werden.");
                    p_code.pop();
                    if p_code == "exit" { break 'l; }
                    else if p_code == "keep X" { keep = true; p_code = String::from("X"); }
                    else if p_code == "keep O" { keep = true; p_code = String::from("O"); }
                }
                let (pos, p) = (H::Pos::from(&pos_code), H::Player::from(&p_code));
                match pos.won() {
                    Some(won) => {
                        println!("{}/{}    -    {} hat gewonnen.", pos.write(), p.c(), won.togre().write());
                    }
                    None => {
                        let folgestellungen = pos.folgestellungen(&p);
                        if folgestellungen.len() == 0 {
                            println!("{}/{}    -    Final Remis.", pos.write(), p.c());
                        } else {
                            println!("{}/{}    -    {:?}", pos.write(), p.c(), H::Togre::write_option(db.get(&pos, &p)));
                            for f in folgestellungen {
                                println!("    {}/{}    -    {:?}", f.write(), p.not().c(), H::Togre::write_option(db.get(&f, &p.not())));
                            }
                        }
                    }
                }
            }
            println!("Inspect beendet.")
        }
        // "halbkreis" | "hk" => {
            // rusty-togre hk [-v[1, 2, 3]] -w out.hkdb ef.kl X 8
            // match args[1] {
            //     "-v2" => { args.remove(0); ha2::HK::tool(&mut args) },
            //     "-v3" => { args.remove(0); ha3::HK::tool(&mut args) },
            //     "-v1" => { args.remove(0); HK::tool(&mut args) },
            //     _ => { HK::tool(&mut args) }
            // }
        // }
        "calc_hk_unit" => {
            let unit_size = args[1].to_string().parse::<usize>().expect(&format!("Invalid unit_size input: {}", args[1]));
            let mut hk = HK::Halbkreis::from(std::fs::read_to_string("CALC.hkdb").expect("CALC.hkdb konnte nicht gelesen werden."));
            let mut tdb = T::DB::from(std::fs::read_to_string("CALC.togredb").expect("CALC.togredb konnte nicht gelesen werden."));
            let mut hk_tdb = T::DB::from(std::fs::read_to_string("CALC.hk.togredb").expect("CALC.hk.togredb konnte nicht gelesen werden."));

            for _ in 0..unit_size {
                if let Some((pos, p)) = hk.c.drop_one() {
                    let t = tdb.calc(&pos, p, false).t;
                    hk_tdb.set(pos, &p, &t);
                } else { break; }
            }

            




        }
        "convert" => {
            println!("{} = {:?}", args[1], H::Pos::from(args[1]))
        }
        "info" => {
            println!("RUSTY TOGRE Versionen");
            println!("V1: {}", INFO);
            // println!("V2: {}", ha2::INFO);
            // println!("V3: {}", ha3::INFO);
        }
        "" | "help" => {
            println!("{}", std::fs::read_to_string("help.txt").expect("help.txt konnte nicht gelesen werden."));
            println!("Bitte beachten: halbkreis und die Versionsauswahl bei calc sind im")
        }
        _ => {
            println!("Unzulässiger Befehl: {} - Nutze 'help' für Hilfe.", args[0])
        }
    }
}
