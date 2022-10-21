<script lang="ts">
    import Brett from "./brett/Brett.svelte";
    import Status from "./Status.svelte";
    import OverlayBase from "./Overlays/OverlayBase.svelte";
    import Stellung_Overlay from "./Overlays/Stellung_Overlay.svelte";
    import Final_Overlay from "./Overlays/Final_Overlay.svelte";
    import Automatenauswahl from "./Automatenauswahl.svelte";
    import Statistik from "./Statistik.svelte";
    import Togre from "./Togre.svelte";
    
    import { onMount, onDestroy } from "svelte";
    import type { Unsubscriber } from "svelte/store";

    import H from "../core";
    import run from "../auto";
    import { view, stellung, amZug, overlay, hist, final, action, state, auto_X, auto_O, auto_working, auto_auto, auto_wait, classicView, vorschlagRechnen, shouldValidate, mode, lastMovTarget } from "../stores";
    import {download} from "../tools";

    let selected = -1;

    let hover = -1;

    let brett: Brett;
    let brettSize = 600;
    let feldnummern: "alnum" | "num" | "coord" | "chess" | "" = "num";
    let turn = false;

    const unsubscribers = [] as Unsubscriber[];

    unsubscribers.push(final.subscribe(f => {
        if (f) reportFinal(f);
    }));
    unsubscribers.push(view.subscribe(v => {
        if (v === "std") mode.set("spiel");
    }));

    onDestroy(() => unsubscribers.forEach(u => u()));

    function reportFinal (f: H.Final | "") {
        console.log("🎉 Spielende: " + f);
        $overlay = "final";
    }

    function autoCheck () {
        if ($final) return;
        const auto = ($amZug.x) ? $auto_X : $auto_O;
        if (auto) {
            $auto_working = $amZug.c;
            run($stellung, $amZug, auto, ($auto_wait * 1000) + 500).then(antwort => {
                $auto_working = "";
                $stellung = antwort.ziel;
                $amZug = $amZug.t;
                $lastMovTarget = antwort.to;
                hist.add($stellung, $amZug);
                if ($auto_auto) autoCheck();
            }, reason => {
                console.error("Das Promise von Auto.run wurde rejected. Reason folgt als throw.");
                throw reason;
            });
        }
    }

    function handleKeyup (event: KeyboardEvent) {
        if (event.target instanceof HTMLInputElement && (<HTMLInputElement>event.target).type === "text") return;
        switch (event.key) {
            case "s": {
                if ($state === "aktiv") return;
                if ($overlay === "none" && $view !== "std") $overlay = "stellung";
                break;
            }
            case "t": {
                if ($state === "aktiv") return;
                if ($view !== "std") tauschen();
                break;
            }
            case "z": {
                if ($state === "aktiv") return;
                brett.undo();
                break;
            }
            case "1": {
                if ($view !== "std" && event.ctrlKey) $mode = "spiel";
                break;
            }
            case "2": {
                if ($view !== "std" && event.ctrlKey) $mode = "stat";
                break;
            }
            case "3": {
                if ($view !== "std" && event.ctrlKey) $mode = "togre";
                break;
            }
        }
    }

    function tauschen () {
        $amZug = $amZug.t;
        hist.add($stellung, $amZug);
    }

    function blur (event: Event) {
        (<HTMLElement>event.target).blur();
    }

</script>

<Status
    action = {$action}
    bind:selected
    bind:hover
    {tauschen}
/>
<div id="ROOT_L" class="ROOT">

    <!-- svelte-ignore security-anchor-rel-noreferrer -->
    <a
        href={document.location.href + `?s=${H.convert.c($stellung)}&p=${$amZug.c}`}
        target="_blank"
        style="display: block; border: 1px solid white; border-radius: 5px; padding: 4px; background-color: white; margin-bottom: 10px;"
    >Neues Fenster</a>
    
    Ansicht: <select bind:value={$view} disabled={$state === "aktiv"} on:input={blur}>
        <option value="std">Normal</option>
        <option value="dev">Entwickler</option>
        <option value="pro">Programierer</option>
    </select><br>
    
    <button disabled={$state === "aktiv"} on:click={() => brett.undo()}>Rückgängig</button><br>

    {#if $view !== "std"}
        <button on:click={tauschen} disabled={$state === "aktiv"}>Tauschen</button><br>
        <button on:click={() => {$stellung = H.mirror($stellung)}}>Spiegeln (X-Achse)</button><br>

        Modus: <select bind:value={$mode} disabled={$state === "aktiv"} on:input={blur}>
            <option value="spiel">Spielbrett</option>
            <option value="stat">Statistische Auswertung</option>
            <option value="togre">TOGRE-Rechner</option>
        </select><br>
        
        <label><input type="checkbox" disabled={$state === "aktiv"} bind:checked={$shouldValidate}> Ungültige Züge sperren</label><br>
    {/if}
    <label><input disabled={$state === "aktiv"} type="checkbox" bind:checked={$vorschlagRechnen}> Mögliche Züge errechnen</label><br>
    <label><input disabled={$state === "aktiv"} type="checkbox" bind:checked={turn}> Brett drehen</label><br>

    {#if $view !== "std"}
        <label style="display:inline;"><input disabled={$state === "aktiv"} type="checkbox" bind:checked={$classicView}> Klassische Ansicht</label><br>
        Feldnummern-Format: <select bind:value={feldnummern} disabled={$state === "aktiv"} on:input={blur}>
            <option value="">— Keine —</option>
            <option value="alnum">Alphanumerisch</option>
            <option value="num">Nummeriert</option>
            <option value="coord">Koordinaten</option>
            <option value="chess">Schach-Format</option>
        </select>
        <br><br>
    {/if}
    {#if $view === "pro" && $state !== "aktiv"}
        <!-- <hr>
        Halbkreis mit dem Grenzwert 9 über der Startstellung berechnen, als JSON kodieren und herunterladen:<br>
        <button on:click={halbkreisgenerator}>Start</button> -->
        <!-- <hr>
        <button on:click={() => console.log($hist.map(e => e.stellung + " " + e.amZug + " " + e.auto))}>Log Hist</button>
        <button on:click={() => console.log($final)}>Log Final</button>
        <button on:click={() => console.log($overlay)}>Log Overlay</button>
        <button on:click={() => console.log([$auto_X, $auto_O])}>Log Autos</button>
        <button on:click={() => console.log($auto_working)}>Log store "auto_working"</button>
        <button on:click={() => console.log($auto_wait)}>Log store "auto_wait"</button>
        <button on:click={() => console.log($mode)}>Log store "mode"</button>
        <button on:click={() => console.log(feldnummern)}>Log feldnummern</button> -->
    {/if}
</div>
<div id="ROOT_M" class="ROOT">
    <div class="M_tool__" class:M_tool__idle={$mode !== "spiel"}>
        <Brett
            bind:this       = {brett}
            classic         = {$classicView}
            vorschlag       = {true}
            bind:selected
            bind:size       = {brettSize}
            bind:hover
            on:userzug={() => ($auto_auto ? autoCheck() : undefined)}
            {feldnummern}
            turn            = {turn}
        />
    </div>
    <div class="M_tool__" class:M_tool__idle={$mode !== "stat"}>
        <Statistik />
    </div>
    <div class="M_tool__" class:M_tool__idle={$mode !== "togre"}>
        <Togre />
    </div>
</div>
<div id="ROOT_R" class="ROOT">
    <Automatenauswahl on:autoCheck={autoCheck}/>
</div>

{#if $overlay === "test"}
    <OverlayBase
        width={500}
    >
        Test-Overlay
        <input type="text">
    </OverlayBase>
{/if}
{#if $overlay === "stellung"}
    <Stellung_Overlay/>
{/if}
{#if $overlay === "final"}
    <Final_Overlay
        final = {$final}
    ></Final_Overlay>
{/if}

<svelte:window on:keyup={handleKeyup}></svelte:window>

<style>
    * {
        box-sizing: border-box;
    }
    .ROOT {
        float: left;
        height: calc(100% - 45px);
        overflow: scroll;
        background-color: #222;
        color: white;
    }
    #ROOT_M {
        width: 650px;
        /* border: 5px dotted green; */
    }
    #ROOT_L, #ROOT_R {
        width: calc(50% - 325px);
        padding: 10px;
        /* min-width: 160px; */
    }
    #ROOT_L {
        border-right: 1px solid black;
    }
    #ROOT_R {
        border-left: 1px solid black;
    }
    .M_tool__ {
        padding: 10px;
    }
    .M_tool__idle {
        display: none;
    }
    #ROOT_L label {
        display: inline;
    }
</style>