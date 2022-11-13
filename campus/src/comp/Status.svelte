<script lang="ts">
    import H from "../core";
    import Automatenauswahl from "./Automatenauswahl.svelte";
    import { amZug, hist, overlay, stellung, state, view, mobile } from "../stores";

    export let action: string = "";
    export let selected: number = -1;
    export let hover: number = -1;
    export let tauschen: () => void;

    function feldinfo (index: number): string {
        if (index + 1) {
            let x = index % 6;
            return `'${index.toString(36).toUpperCase()}'|${((index < 10) ? "&nbsp;" : "") + index}|${x}x${(index - x) / 6}`;
        } else return "&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;";
    }

</script>

<div id="__" class={$state}>
    <!-- STELLUNGSCODE -->
    {#if $view !== "std" && $mobile === false}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div id="stellung__" class:button={true} on:click={() => {
            if ($state !== "aktiv") $overlay = "stellung";
        }}>
            <span id="stellung">
                {H.convert.c($stellung)}
            </span>
        </div>
    {/if}

    <!-- PLAYER -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div id="amZug" style="padding: 0;" class:button={true}
        on:click={() => $view !== "std" && $state !== "aktiv" && tauschen()}
        title={($view === "std") ? "Am Zug ist " + $amZug.c : "Tauschen durch Klicken"}
    >
        <img src={`./img/Fig${$amZug.c}.png`} width="43" alt="ONO">
    </div>

    <!-- ACTION-TEXT -->
    {#if $mobile === false}
        <div id="action" class:std={$view === "std"}>
            <span>
                {@html action.replace(" ", "&nbsp;")}
            </span>
        </div>
    {/if}

    <!-- AUTOMAT_BUTTON -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div id="automat"
        class:button={true}
        style="padding: 0;"
        on:click={() => { if ($state !== "aktiv") $overlay = "auto"}}
    >
        <img src="./img/roboter.png" width="45" alt="A" title="Automatenauswahl">
    </div>

    <!-- FELDDATEN -->
    {#if $view !== "std" && $mobile == false}
        <div id="selected">{@html feldinfo(selected)}</div>
        <div id="hover">{@html feldinfo(hover)}</div>
    {/if}

</div>

<style>
    @keyframes aktiv {
        0% {
            background-color: #66f;
        }
        100% {
            background-color: #44d;
        }
    }
    #__ {
        width: 100%;
        height: 45px;
        background-color: #4caf50;
        overflow-y: scroll;
        overflow-x: hidden;
        transition: 0.4s;
    }
    #__.aktiv {
        background-color: #66f;
        animation: aktiv 2s infinite alternate;
    }
    #__.ende {
        background-color: #ec4545;
    }
    #__ > div {
        float: left;
        height: 100%;

        overflow: hidden;
        line-height: 35px;
        padding: 4px 8px;

        font-family: 'Courier New', Courier, monospace;
        font-weight: bold;
        font-size: 20px;
        text-align: center;
        border: 1px solid #444;
    }
    #stellung__ {
        width: 200px;
    }
    #stellung {
        display: inline-block;
        height: 100%;
        width: 100%;
    }
    #amZug, #automat {
        width: 45px;
    }
    .button {
        transition: 0.2s;
    }
    .button:hover {
        background-color: #8c8;
    }
    #automat img {
        margin: 0;
    }
    #selected, #hover {
        width: 145px;
    }
    #action {
        width: calc(100% - 580px);
        min-width: 190px;
        /* overflow-y: scroll; */
    }
    #action.std {
        width: calc(100% - 40px);
    }

    /* Tooltip, das sich aufklappt, wenn parent-button gehovered wird. vllt mal praktisch… */
    /* #auto_tool {
        opacity: 0;
        pointer-events: none;

        background-color: #444;
        position: absolute;
        top: 45px;
        transition: 0.2s;
        border-radius: 3px;
        box-shadow: 4px 4px 4px #000;
    }
    #automat:hover #auto_tool {
        opacity: 1;
        pointer-events: all;
    } */

</style>
