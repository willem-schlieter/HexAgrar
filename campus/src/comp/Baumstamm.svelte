<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import H from "../core";
    import { RustyT } from "../togre";
    import { rustyTChange, ti_clicked_id, stellung, amZug } from "../stores";

    let dispatch = createEventDispatcher();
    
    export let option: H.Option;
    export let p: H.Player;
    export let id: number;
    export let collapsed: boolean;
    export let openable: boolean;
    export let hover: boolean = false;
    export let display: {
        p_before: boolean,
        p_after: boolean,
        zug: boolean,
        pos: boolean
    };
    export let feldnummern: H.FeldFormat;
    export let autocalc: boolean;

    function updateTogre (changeID: number, option: H.Option, p: H.Player): H.Final | null {
        try {
            return autocalc ? RustyT.calc(option.ziel, p.t, true)[0] : RustyT.get(option.ziel, p.t);
        } catch (err) {
            if (err instanceof Error && err.message === "RustyTogreDB wurde noch nicht geladen.") { return null; }
            else { throw err; }
        }
    }
    $: togre = updateTogre($rustyTChange, option, p);
    let wait = false;
    function calc (): void {
        wait = true;
        setTimeout(() => {
            RustyT.calc(option.ziel, p.t);
            wait = false;
        }, 5);
    }

</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div id="BAUMSTAMM_ROOT"
    on:mouseenter={() => {if ($ti_clicked_id === -1) hover = true;}}
    on:mouseleave={() => hover = false}
    class:hover={hover || $ti_clicked_id === id}
>
    <div id="collapse__">
            {#if openable}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <img id="collapse" src="./img/pfeil2.png" height="25" alt="&gt;" on:click={() => collapsed = ! collapsed} class:collapsed={collapsed}>
            {:else}
                <img src="./img/final.png" alt="F" id="collapse" height="25">
            {/if}
        </div>
    <div id="main"
        class:openable
        on:click={() => {
            if ($ti_clicked_id === id) $ti_clicked_id = -1;
            else $ti_clicked_id = id;
        }}
        on:dblclick={() => {
            dispatch("userzug", {newpos: option.ziel, newp: p.t})
        }}
    >
        {#if display.p_before}
            <img class="main_child" src={p.x ? "./img/FigX.png" : "./img/FigO.png"} height="25" alt={p.c}>
        {/if}
        {#if display.zug}
        <div class="main_child ti_feld ti_feld_start">{H.fconvert(option.from).format(feldnummern)}</div>
        
        <img class="main_child" src="./img/pfeil.png" alt="->" height="25">
        
        <div class="main_child ti_feld ti_feld_ziel">{H.fconvert(option.to).format(feldnummern)}</div>
        {/if}
        {#if display.pos}
            <div class="main_child ti_feld">{H.convert.c(option.ziel)}</div>
        {/if}
        {#if display.p_after}
            <img class="main_child" src={p.t.x ? "./img/FigX.png" : "./img/FigO.png"} height="25" alt={p.t.c}>
        {/if}
    </div>
    <div id="togre">
        {#if wait === true}
            <img src="./img/wait.png" alt="?" height="25">
        {:else}
            {#if togre !== null}
                <img src={`./img/Fig${togre.toUpperCase()}.png`} height="25" alt={togre}>
            {:else}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <img src="./img/unknown.png" alt="?" height="25" on:click={calc}>
            {/if}
        {/if}
    </div>
</div>

<style>
    * {
        box-sizing: border-box;
    }
    #BAUMSTAMM_ROOT {
        height: 37px;
        width: 100%;
        border: 1px solid #ccc;
        border-bottom: none;
        background-color: #ffd;
        color: black;
        padding: 5px 0;
    }
    #BAUMSTAMM_ROOT.hover {
        background-color: #cca;
    }
    #collapse__, #main, #togre {
        float: left;
        height: 100%;
        overflow-x: auto;
        overflow-y: hidden;
    }
    #collapse, #togre {
        width: 30px;
    }
    #main {
        width: calc(100% - 60px);
    }
    .ti_feld {
        background-color: #ccc;
        border: 0.5px solid #444;
        border-radius: 2px;
        box-sizing: border-box;
        height: 25px;
        min-width: 35px;
        padding: 0 5px;
        text-align: center;
        font-family: monospace;
        font-size: 14pt;
    }
    .ti_feld_start {
        background-color: #f99;
    }
    .ti_feld_ziel {
        background-color: #8d8;
    }
    .main_child {
        float: left;
        margin: 0 5px;
    }
    img {
        margin: auto;
    }
    #collapse {
        transition: 0.2s;
    }
    .collapsed {
        transform: rotate(-90deg);
    }

</style>