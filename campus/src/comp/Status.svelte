<script lang="ts">
    import H from "../core";
    import Stellung from "./Stellung.svelte"
    import { amZug, hist, overlay, stellung, state, view } from "../stores";

    function feldinfo (index: number): string {
        if (index + 1) {
            let x = index % 6;
            return `'${index.toString(36).toUpperCase()}'|${((index < 10) ? "&nbsp;" : "") + index}|${x}x${(index - x) / 6}`;
        } else return "&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;";
    }

    export let action: string = "";
    export let selected: number = -1;
    export let hover: number = -1;
    export let tauschen: () => void;

</script>

<div id="__" class={$state}>
    {#if $view !== "std"}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div id="stellung" on:click={() => {
            if ($state !== "aktiv") $overlay = "stellung";
        }}>
            <Stellung stellung={$stellung}/>
        </div>
    {/if}

    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div id="amZug" on:click={() => ($view === "std" || $state === "aktiv") ? undefined : tauschen()} title={($view === "std") ? "Am Zug ist " + $amZug.c : "Tauschen durch Klicken"}>{$amZug.c}</div>

    <div id="action" class:std={$view === "std"}>
        <span>
            {@html action.replace(" ", "&nbsp;")}
        </span>
    </div>

    {#if $view !== "std"}
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
    #stellung {
        width: 200px;
    }
    #amZug {
        width: 40px;
    }
    #selected, #hover {
        width: 145px;
    }
    #action {
        width: calc(100% - 530px);
        min-width: 190px;
        /* overflow-y: scroll; */
    }
    #action.std {
        width: calc(100% - 40px);
    }

</style>
