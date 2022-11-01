<script lang="ts">
    import DevOutTable from "./DevOutTable.svelte";
    import { amZug, state, stellung, togreRunning } from "../stores";
    import T from "../togre";
    import H from "../core";
    import { download } from "../tools";

    const db = T.stdDB;

    function start () {
        $togreRunning = true;
        window.setTimeout(() => {
            if (useRust) {
                const before = Date.now();
                const [res, entries] = T.rustyTogre($stellung, $amZug);
                out.log([
                    H.convert.c($stellung) + "<br>Player." + $amZug.c,
                    "<b>RustyTogre</b>",
                    `<h3 style="font-size: 200%; color: red; display: inline; margin: 20px">${res}</h3>`,
                    String(Date.now() - before) + "ms",
                    entries.toLocaleString()
                ]);
            } else {
                const result = db.calc(H.convert.c($stellung), $amZug, optMeth, prefdb);
                const output = [
                    result.s + "<br>Player." + result.p,
                    (result.optionMethod) + "<br>" + (result.prefdb ? "Ja" : "Nein"),
                    `<h3 style="font-size: 200%; color: red; display: inline; margin: 20px">${result.t}</h3>`,
                    result.time.toLocaleString() + "ms",
                    (result.db.xnew + result.db.onew).toLocaleString()
                ];
                out.log(output);
            }
            $togreRunning = false;
        }, 1000);
    }

    function dbclear () {
        const len = db.len();
        db.clear();
        if (len) out.log("Datenbank wurde geleert: " + len.toLocaleString() + " Einträge gelöscht.");
    }

    function save () {
        download("Download.togreDB.json", db.stringify(prompt("Bitte gib einen Kommentar für diesen Download an. Er wird zusammen mit den Datenbankinhalten in der heruntergeladenen Datei gesichert, damit du später nachvollziehen kannst, woher dieser Download stammt.")));
    }

    let out: DevOutTable;
    // let logfin: boolean = true;
    let prefdb: boolean = true;
    let showOpts = false;
    let optMeth: "pure" | "logfin" | "preffin" = "pure";
    let useRust = true;
</script>

<h1 style="display:inline;">TOGRE-Rechner:</h1>

<button id="start" on:click={start} disabled={$state === "aktiv"}>Start</button>
<button on:click={() => {out.clear(); if (db.len()) out.log("Ausgabe gelöscht. " + db.len().toLocaleString() + " Einträge in der DB.");}} disabled={$state === "aktiv"}>Ausgabe löschen</button>
<button on:click={dbclear} disabled={$state === "aktiv"}>Datenbank leeren</button>

<label><input type="checkbox" bind:checked={ useRust }> RustyTogre</label>
<small>RustyTogre ist ein alternativer TOGRE-Rechner, der in Rust entwickelt ist. Er ist erheblich schneller. Achtung: RustyTogre verwendet seine eigene Datenbank und kann nicht auf die Datenbank des normalen Rechners zugreifen. Die Rust-Datenbank kann nur durch Neuladen der Seite gelöscht werden.</small><br><br>

<button style="font-size: 8pt;"><label>
    <input type="checkbox" style="margin-bottom: 0;" bind:checked={showOpts}> Optimierungsdetails anzeigen</label>
</button>
<table style="display:{showOpts ? '' : 'none'};"><tr><td>
    <label style="display: inline;">Optionsmethode: <select bind:value={optMeth}>
        <option value="pure">Syntaktisch ("pure")</option>
        <option value="logfin">LogFin-Eigenprüfung ("logfin")</option>
        <option value="preffin">LogFin-Optionsprüfung ("preffin")</option>
    </select></label><br>
    <small>Die Methode "logfin" führt meist zu einer Verschlechterung der Performance, reduziert aber die DB-Belastung. Bei "preffin" ist dieser Effekt noch stärker.</small>
<!--     
    <label style="display: inline;"><input type="checkbox" bind:checked={logfin}> LogFin-Prüfung</label><br>
    <small>Die logische Finalitätsprüfung (LogFin) kann die Belastung der Datenbank verringern und zur Beschleunigung des Rechenprozesses führen. Je nach Konstellation ist aber auch eine Verlangsamung möglich. Das Ergebnis wird jedoch nicht beeinflusst.</small> -->
</td><td>
    <label style="display: inline;"><input type="checkbox" bind:checked={prefdb}> prefDB-Variante</label><br>
    <small>Hier wird unter den Optionen zunächst nach vorhandenen Einträgen in der Datenbank gesucht, bevor tatsächlich rekursiv gerechnet wird. Dies kann die Datenbank entlasten und die Performance verbessern.</small>
</td></tr></table>
    
<DevOutTable bind:this={out} keys={["Konstellation", "OptMeth<br>prefDB", "Ergebnis", "Zeit", "Neue<br>DB-Einträge"]}/>
<br>
<button on:click={save} title="Die aktuellen Inhalte der Datenbank werden komprimiert kodiert und in deinem Downloads-Ordner als 'Download.togreDB.json' gesichert.">Datenbankinhalte als Datei sichern</button>


<style>
    #start {
        font-size: 20pt;
    }
</style>