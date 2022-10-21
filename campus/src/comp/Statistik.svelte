<script lang="ts">
    import DevOutTable from "./DevOutTable.svelte";

    import { Stat } from "../auto";
    import { amZug, auto_O, auto_X, state, statRunning, stellung } from "../stores";
    import H from "../core";

    function start () {
        $statRunning = true;
        window.setTimeout(() => {
            let stat = new Stat($stellung, $amZug, [($auto_X || "rtf"), ($auto_O! || "rtf")], [null, null], spiele || 20);
            let output = [
                H.convert.c($stellung) + "<br>Player." + $amZug.c + "<br><b>" + $auto_X + " - " + $auto_O + "</b><br>" + spiele + " Spiele",
                `<h3 style="font-size: 200%; color: red; display: inline; margin: 20px">X:${Math.floor(stat.fx)}% O:${Math.floor(stat.fo)}% R:${Math.floor(stat.fr)}%</h3>`,
                `min: ${stat.minlen} <br>av: ${Math.floor(stat.avlen * 100)/100} <br>max: ${stat.maxlen}`
            ];
            out.log(output);
            $statRunning = false;
        }, 1000);
    }

    
    let spiele = 20;
    let out: DevOutTable;

</script>

<h1>Statistische Auswertung</h1>

Durchläufe: <input type="number" min={1} step={1} bind:value={spiele}>

<button id="start" on:click={start} disabled={! $auto_X || ! $auto_O || $state === "aktiv"}>Start</button>
<button on:click={out.clear} disabled={$state === "aktiv"}>Ausgabe löschen</button>

<DevOutTable bind:this={out} keys={["Konstellation", "Ergebnisse", "Längen"]} />

<style>
    #start {
        font-size: 20pt;
    }
</style>