<script lang="ts">
    import Brett from "./brett/Brett.svelte";
    import BrettBase from "./brett/BrettBase.svelte";
    import Status from "./Status.svelte";
    import Automatenauswahl from "./Automatenauswahl.svelte";
    import Statistik from "./Statistik.svelte";
    import Togre from "./Togre.svelte";
    import OverlayManager from "./Overlays/OverlayManager.svelte";
    
    import { onMount, onDestroy } from "svelte";
    import type { Unsubscriber } from "svelte/store";

    import H from "../core";
    import run from "../auto";
    import { view, stellung, amZug, overlay, hist, final, action, state, auto_X, auto_O, auto_working, auto_auto, auto_wait, shouldValidate, mode, lastMovTarget, ti_hover, ti_before, mobile } from "../stores";
    import {download} from "../tools";
    import Inspektor from "./Inspektor.svelte";

    if (window.innerWidth < 500) $mobile = true;

    let selected = -1;

    let hover = -1;

    let brett: Brett;
    let brettSize = Math.min(600, window.innerWidth - 20);
    let feldnummern: H.FeldFormat = "num";
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
                $lastMovTarget = -1;
                hist.undo();
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
            case "4": {
                if ($view !== "std" && event.ctrlKey) $mode = "ti";
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

    hist.add($stellung, $amZug);
    function handleUserzug (ev) {
        $lastMovTarget = -1;
        $stellung = ev.detail.newpos;
        $amZug = ev.detail.newp;
        if ($auto_auto) autoCheck();
        hist.add($stellung, $amZug);
    }

    let composedPos: H.Numpos = [[], []];
    let composeX = true;
    function compose (feldindex: number) {
        const part = composedPos[composeX ? 0 : 1];
        const other = composedPos[composeX ? 1 : 0];
        const ix = part.indexOf(feldindex);
        if (ix + 1) part.splice(ix, 1);
        else {
            let ix = other.indexOf(feldindex);
            if (ix + 1) other.splice(ix, 1);
            part.push(feldindex);
        }
        composedPos = H.convert.normalize(composedPos);
    }
    function clearComposed () {
        composedPos = [[], []];
    }
    function handleCompose () {
        handleUserzug({detail: {
            newpos: composedPos,
            newp: $amZug
        }});
        $mode = "spiel";
        clearComposed();
    }

</script>

<Status
    action = {$action}
    bind:selected
    bind:hover
    {tauschen}
/>
{#if $mode !== "ti"}
    {#if $mobile === false}
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
                    <option value="ti">TOGRE-Inspektor</option>
                    <option value="compose">Stellungs-Komposition</option>
                </select><br>
                
                <label><input type="checkbox" disabled={$state === "aktiv"} bind:checked={$shouldValidate}> Ungültige Züge sperren</label><br>
            {/if}
            <label><input disabled={$state === "aktiv"} type="checkbox" bind:checked={turn}> Brett drehen</label><br>

            {#if $view !== "std"}
                Feldnummern-Format: <select bind:value={feldnummern} disabled={$state === "aktiv"} on:input={blur}>
                    <option value="">— Keine —</option>
                    <option value="alnum">Alphanumerisch</option>
                    <option value="num">Nummeriert</option>
                    <option value="coord">Koordinaten</option>
                    <option value="chess">Schach-Format</option>
                </select>
                <br><br>
            {/if}
        </div>
    {/if}
    <div id="ROOT_M" class="ROOT">
        <div class="M_tool__" class:M_tool__idle={$mode !== "spiel" && $mode !== "compose"}>
            {#if $mode !== "compose"}
                <Brett
                    bind:stellung   = {$stellung}
                    bind:amZug      = {$amZug}
                    bind:this       = {brett}
                    bind:selected
                    bind:size       = {brettSize}
                    bind:hover
                    on:userzug={handleUserzug}
                    {feldnummern}
                    turn            = {turn}
                    emph            = {{lastTarget: $lastMovTarget}}
                    disabled        = {!! $final || ($state === "aktiv")}
                />
            {:else}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <img src="./img/FigX.png" alt="X" width="40" on:click={() => composeX = true} style={composeX ? "border: 2px solid blue" : ""}>
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <img src="./img/FigO.png" alt="O" width="40" on:click={() => composeX = false} style={composeX ? "" : "border: 2px solid blue"}>
                <button on:click={clearComposed}>Clear</button>
                <button on:click={handleCompose}>Diese Stellung setzen.</button>
                <BrettBase
                    stellung        = {composedPos}
                    selected        = {-1}
                    xAmZug          = {true}
                    oAmZug          = {true}
                    size            = {brettSize - 30}
                    bind:hover
                    {feldnummern}
                    {turn}
                    emph = {{}}
                    disabled        = {!! $final || ($state === "aktiv")}
                    on:feldclick    = {(ev) => compose(ev.detail.feldindex)}
                />
            {/if}
        </div>
        <div class="M_tool__" class:M_tool__idle={$mode !== "stat"}>
            <Statistik />
        </div>
        <div class="M_tool__" class:M_tool__idle={$mode !== "togre"}>
            <Togre />
        </div>
    </div>
    {#if $mobile === false}
        <div id="ROOT_R" class="ROOT">
            <Automatenauswahl
                on:autoCheck={autoCheck}
            />
        </div>
    {/if}
{:else}
    <div class="ROOT" id="TI_ROOT_R">
        <Inspektor
            stellung={$stellung}
            player={$amZug}
            on:userzug={handleUserzug}
            {feldnummern}
            disabled        = {!! $final || ($state === "aktiv")}
        />
    </div>
    <div class="ROOT" id="TI_ROOT_L">
        <Brett
            bind:stellung   = {$ti_before[0]}
            bind:amZug      = {$ti_before[1]}
            bind:this       = {brett}
            bind:selected
            bind:size       = {brettSize}
            bind:hover
            on:userzug={handleUserzug}
            {feldnummern}
            turn            = {turn}
            emph            = {{
                blurred: $ti_hover ? [$ti_hover[0].from] : [],
                green: $ti_hover ? [$ti_hover[0].to] : [],
                lastTarget: $lastMovTarget
            }}
            disabled        = {!! $final || ($state === "aktiv")}
        />
    </div>
{/if}


<OverlayManager
    on:autoCheck={autoCheck}
/>

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
    /* #ROOT_M {
        width: 650px;
    } */
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

    #TI_ROOT_L {
        width: 650px;
        padding: 10px;
    }
    #TI_ROOT_R {
        width: calc(100% - 660px);
    }
</style>