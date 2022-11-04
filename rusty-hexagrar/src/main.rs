pub mod hexagrar;
use hexagrar::*;
use H::Pos;
use std::time::Instant;

extern crate termion;
use termion::{color, style};

struct Clock {
    start: Instant
}
impl Clock {
    pub fn new() -> Clock { Clock { start: Instant::now() } }
    pub fn since(&self) -> u128 { Instant::now().duration_since(self.start).as_millis() }
    pub fn reset(&mut self) { self.start = Instant::now(); }
}

fn emph(text: String) -> String {
    format!("{}{} {} {}{}",
        color::Bg(color::Yellow),
        style::Bold,
        text,
        style::Reset,
        color::Bg(color::Reset)
    )
}

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

fn read_file(path: &str) -> String {
    std::fs::read_to_string(path).expect(format!("Datei {} konnte nicht gelesen werden.", path).as_str())
}
fn write_file(path: &str, content: String) {
    std::fs::write(String::from(path), content).expect(format!("Datei {} konnte nicht beschrieben werden.", path).as_str());
}

fn read_line() -> String {
    let mut s = String::from("");
    std::io::stdin().read_line(&mut s).expect("Input konnte nicht gelesen werden.");
    s.pop();
    s
}

fn main() {
    let args_old: Vec<String> = std::env::args().collect();
    let mut args: Vec<&str> = args_old.iter().map(|s| &**s).collect();
    while args.len() < 10 { args.push("") };
    args.remove(0);

    match args[0] {
        "test" => {
            let a = 72000.0;
            let b = 848.0;
            println!("{:.2}%", (b / (a + b)) * 100.0);
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
            let res = db.calc(&H::Pos::from(args[1]), &H::Player::from(args[2]), args[3] == "-full");


            println!("{}", message(res, Instant::now().duration_since(before).as_millis()));
            if write {
                std::fs::write(file.clone(), db.write()).expect(format!("Could not be written to {}", file).as_str());
            }
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
            let threads = args[1].parse::<u8>().expect(format!("Invalid thread count: {}", args[1]).as_str());

            let before = Instant::now();

            // let res = T::calc_conc(&mut T::DB::new(), &H::Pos::from("1234.vwxy"), H::Player::X, 8);
            let res = T::calc_para(&mut T::DB::new(), &H::Pos::from("1234.vwxy"), H::Player::X, threads);

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
        "hk" => {
            //    0  1     2 3 4
            // rt hk ef.kl X 6 out.hkdb
            let pos = Pos::from(args[1]);
            let poscode = pos.write();
            let p = H::Player::from(args[2]);
            let tiefe = args[3].parse::<usize>().expect(format!("Unzulässige Tiefe: {}", args[3]).as_str());
            let path = args[4];

            let before = Instant::now();
            let hk = HK::Halbkreis2::gener(pos, &p, tiefe);
            println!("Halbkreis von {}/{} aus mit Tiefe {} berechnet: {} Einträge, {}ms.", poscode, p.c(), tiefe, emph(hk.len().to_string()), emph(Instant::now().duration_since(before).as_millis().to_string()));

            std::fs::write(path, hk.write(format!("Zugtiefen-Halbkries ('HK2'): {}/{} (tiefe={})", poscode, p.c(), tiefe))).expect(format!("Datei konnte nicht beschrieben werden: {}", path).as_str());
        }
        "stepALT" => {
            println!("Willkommen bei TOGREstep!\nLade Dateien…");

            let mut clock = Clock::new();

            // Bedingung, damit Einträge dauerhaft in der helper_DB gespeichert werden.
            let helper_condition = |p: &Pos| -> bool {
                // Sind mehr als 7 Figuren auf dem Feld?
                p.0.len() + p.1.len() > 7
            };

            let mut hk = HK::Halbkreis2::from(read_file("step_hk.hkdb"));
            let mut helper_db = T::DB::from(read_file("step_helperdb.togredb"));
            let mut result_db = T::DB::from(read_file("step_result.togredb"));

            // let mut current = (Pos::from("ef.kl"), H::Player::X);

            println!("Es kann losgehen!");

            'l: loop {
                if let Some(current) = hk.c.drop_one() {
                    let mut input = String::from("");
                    while input != "j" && input != "n" && input != "q" && input != "z" {
                        println!("\nStellung {}/{} berechnen?", current.0.write(), current.1.c());
                        println!("[j]a    [z]eitlang    [n]ein, nächste    [q]uit");
                        input = read_line();
                    }
                    match input.as_str() {
                        "j" => {
                            println!("Berechnung wird gestartet…");
                            clock.reset();
                            let res = helper_db.calc(&current.0, &current.1, false);
                            result_db.set(current.0, &current.1, &res.t);
                            println!("{}", message(res, clock.since()));
                            
                            println!("Ergebnisse werden gespeichert…");
                            write_file("step_hk.hkdb", hk.write(String::from("TOGREstep Session.")));
                            write_file("step_result.togredb", result_db.write());
                            write_file("step_helperdb.togredb", T::DB::new().import_filtered(&helper_db, helper_condition).write());
                        }
                        "n" => {
                            hk.c.add(current.0, &current.1);
                        }
                        "z" => {
                            // Hier brauchen wir current nicht.
                            hk.c.add(current.0, &current.1);

                            // Zeit, die gerechnet werden soll, in ms.
                            let mut time: u128 = 0;
                            let mut elapsed: u128 = 0;

                            println!("\n'TOGREstep Zeitlang' ermöglicht dir, TOGREstep eine bestimmte Zeit lang rechnen zu lassen, ohne nach jedem Schritt gefragt zu werden, ob du weiter machen möchtest.");
                            'w: while time == 0 {
                                println!("Wie viele Sekunden soll 'Zeitlang' rechnen?");
                                if let Ok(t) = read_line().parse::<u128>() {
                                    time = t * 1000;
                                    break 'w;
                                } else {
                                    println!("Bitte gib eine gültige Zahl ein!");
                                }
                            }
                            
                            let mut times: u32 = 0;
                            while elapsed < time {
                                times += 1;
                                if let Some(current) = hk.c.drop_one() {
                                    println!("\nBerechne {}/{}…", &current.0.write(), current.1.c());
                                    clock.reset();
                                    let res = helper_db.calc(&current.0, &current.1, false);
                                    result_db.set(current.0, &current.1, &res.t);
                                    println!("{}", message(res, clock.since()));
                                    elapsed += clock.since();

                                    if times % 10 == 0 {
                                        println!("Zur Sicherheit zwischendurch speichern…");
                                        write_file("step_hk.hkdb", hk.write(String::from("TOGREstep Session.")));
                                        write_file("step_result.togredb", result_db.write());
                                        write_file("step_helperdb.togredb", T::DB::new().import_filtered(&helper_db, helper_condition).write());
                                    }

                                } else {
                                    println!("Die HKDB ist leer - Die Berechnung ist abgeschlossen! Herzlichen Glückwunsch!");
                                    break 'l;
                                }
                            }
                            println!("{} Stellungen berechnet. Ergebnisse werden gespeichert…", times);
                            write_file("step_hk.hkdb", hk.write(String::from("TOGREstep Session.")));
                            write_file("step_result.togredb", result_db.write());
                            write_file("step_helperdb.togredb", T::DB::new().import_filtered(&helper_db, helper_condition).write());
                        }
                        _ => {
                            // Speichern ist wohl nicht nötig, weil bei "j" schon immer gespeichert wird.
                            break 'l;
                        }
                    }
                } else {
                    println!("Die HKDB ist leer - Die Berechnung ist abgeschlossen! Herzlichen Glückwunsch!");
                    break 'l;
                }
            }
        }

        "step" => {
            println!("Willkommen bei TOGREstep!\nBEACHTE: Beende TOGREstep nicht mit ^C oder Ähnlichem, sondern indem du 'q' eingibst! Nur so können alle Berechnungserfolge gespeichert werden. (Beim zwischenzeitigen Abbrechen werden zwar die berechneten HK-Stellungen gesichert, nicht aber die HelperDB.)\nLade Dateien…");

            let mut clock = Clock::new();

            // Bedingung, damit Einträge dauerhaft in der helper_DB gespeichert werden.
            let helper_condition = |p: &Pos| -> bool {
                // Sind mehr als 7 Figuren auf dem Feld?
                p.0.len() + p.1.len() > 9
            };

            let mut hk = HK::Halbkreis2::from(read_file("step_files/step_hk.hkdb"));
            let mut helper_db = T::DB::from(read_file("step_files/step_helperdb.togredb"));
            let mut result_db = T::DB::from(read_file("step_files/step_result.togredb"));
            let mut total_time = read_file("step_files/step_stats").parse::<u128>().expect("Der Inhalt von step_stats ist ungültig.");

            'l: loop {
                let mut input = String::from("");
                while input != "r" && input != "q" && input != "s" {
                    println!("\nWas möchtest du tun?");
                    println!("[r]echnen    [s]tatistik    [q]uit");
                    input = read_line();
                }

                match input.as_str() {
                    "r" => {
                        // Zeit, die gerechnet werden soll, in ms.
                        let mut time: u128 = 0;
                        // Zeit, die schon gerechnet wurde, in ms.
                        let mut elapsed: u128 = 0;
                        // Beendete Berechnungen.
                        let mut times: u32 = 0;

                        // Zeit lesen
                        'w: while time == 0 {
                            println!("Wie viele Sekunden soll gerechnet werden?");
                            if let Ok(t) = read_line().parse::<u128>() {
                                time = t * 1000;
                                break 'w;
                            } else {
                                println!("Bitte gib eine gültige Zahl ein!");
                            }
                        }
                        
                        while elapsed < time {
                            times += 1;
                            if let Some(current) = hk.c.drop_one() {
                                println!("\nBerechne {}/{}…", &current.0.write(), current.1.c());
                                clock.reset();
                                let res = helper_db.calc(&current.0, &current.1, false);
                                result_db.set(current.0, &current.1, &res.t);
                                println!("{}", message(res, clock.since()));
                                elapsed += clock.since();

                                if times % 10 == 0 {
                                    println!("Zur Sicherheit zwischendurch speichern… (Aber nur resultDB)");
                                    write_file("step_result.togredb", result_db.write());
                                    // Um Zeit zu sparen, wird hier nur das Wichtigste gespeichert: Die Ergebnisse. Wenn vorzeitig abgebrochen wird, stehen im HK bereits berechnete Stellungen, was kein Problem ist, weil diese ja dann beim nächsten Mal in 0ms berechnet sind und aus dem HK entfernt werden.
                                    // Auch die HelperDB wird nicht gespeichert, weil das so ewig braucht.
                                }

                            } else {
                                println!("{}", emph(String::from("Die HKDB ist leer - Die Berechnung ist abgeschlossen! Herzlichen Glückwunsch!")));
                                break 'l;
                            }
                        }
                        
                        total_time += elapsed;
                        println!("{} Stellungen in {}ms berechnet. Ergebnisse werden gespeichert…", times, elapsed);
                        write_file("step_files/step_hk.hkdb", hk.write(String::from("TOGREstep Session.")));
                        write_file("step_files/step_result.togredb", result_db.write());
                        
                        // Da das so lange dauert, wird die HelperDB hier nicht gespeichert. Das passiert nur, wenn man ordnungsgemäß beendet, s.u. Es ist auch nicht schlimm, wenn man vorzeitig abgebrochen wird, weil die HelperDB ja optional ist - dann dauert es beim nächsten mal vielleicht etwas länger.
                        // write_file("step_files/step_helperdb.togredb", T::DB::new().import_filtered(&helper_db, helper_condition).write());
                    }
                    "s" => {
                        println!("\n-- TOGREstep STATISTIK --");
                        let hklen = hk.len() as f64;
                        let reslen = result_db.len() as f64;
                        let perc = (reslen / (hklen + reslen)) * 100.0;
                        println!("Noch zu berechnende Stellungen:           {}", hklen);
                        println!("Berechnete Stellungen im Halbkreis:       {} ({:.2}%)", reslen, perc);
                        println!("Größe der HelperDB (zu diesem Zeitpunkt): {}", helper_db.len());
                        println!("Gesamte Rechenzeit seit Beginn:           {}ms = {}min", total_time, total_time / 60000);
                    }
                    _ => {
                        write_file("step_files/step_helperdb.togredb", T::DB::new().import_filtered(&helper_db, helper_condition).write());
                        write_file("step_stats", total_time.to_string());
                        break 'l;
                    }
                }
            }
        }
        
        "calc_hk_unit" => {
            let unit_size = args[1].to_string().parse::<usize>().expect(&format!("Invalid unit_size input: {}", args[1]));
            let mut hk = HK::Halbkreis::from(std::fs::read_to_string("CALC.hkdb").expect("CALC.hkdb konnte nicht gelesen werden."));
            let mut tdb = T::DB::from(std::fs::read_to_string("CALC.togredb").expect("CALC.togredb konnte nicht gelesen werden."));
            let mut hk_tdb = T::DB::from(std::fs::read_to_string("CALC.hk.togredb").expect("CALC.hk.togredb konnte nicht gelesen werden."));

            for _ in 0..unit_size {
                if let Some((pos, p)) = hk.c.drop_one() {
                    let t = tdb.calc(&pos, &p, false).t;
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
