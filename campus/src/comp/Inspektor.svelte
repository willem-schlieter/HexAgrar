<script lang="ts">
    import type H from "../core";
    import { ti_hover, ti_before, ti_clicked_id, mode } from "../stores";

    import Baum from "./Baum.svelte";

    export let stellung: H.Numpos;
    export let player: H.Player;
    export let feldnummern: H.FeldFormat;
    export let disabled: boolean;

    $: option = {from: -1, to: -1, ziel: stellung};

    $: {
        if ($ti_hover === null) $ti_before = [option.ziel, player];
    }

    let autocalc = false;
</script>

<div id="ROOT" class:disabled={disabled}>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <button style="display: inline" on:click={() => {$mode = "spiel"}}>Zurück</button>
    <label style="display: inline; margin-left: 10px" title="Führt zu Verlangsamung. Etwas instabil.">
        TOGRE vorberechnen: <input type="checkbox" bind:checked={autocalc}>
    </label>
    <div id="__" on:mouseleave={() => {
        if ($ti_clicked_id === -1) $ti_hover = null;
    }} >
        <Baum 
            {option}
            p={player.t}
            root={true}
            parent={option}
            on:userzug
            {feldnummern}
            {autocalc}
        />
    </div>

</div>

<style>
    #__ {
        border: 4px solid green;
    }
    #ROOT.disabled {
        pointer-events: none;
        cursor: not-allowed;
        filter: contrast(50%);
    }
</style>