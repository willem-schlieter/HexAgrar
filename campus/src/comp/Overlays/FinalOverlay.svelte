<script lang="ts">
    import OverlayBase from "./OverlayBase.svelte";
    import type Brett from "../brett/Brett.svelte";
    
    import H from "../../core";
    import { amZug, hist, overlay, stellung } from "../../stores";
    import { onMount } from "svelte";

    export let final: string = "R";

    function close () {
        $overlay = "none"
    }

    if (! final) close();

</script>

<OverlayBase width={300} on:enter={close}>
    <div style="text-align:center;">
        <h1>🎉</h1>
        {#if final === "X" || final === "O"}
        <h1>{final}</h1>
        <h3>hat gewonnen.</h3>
        {:else}
        <h3>Das Spiel endet im </h3>
        <h1>Remis.</h1>
        {/if}
    </div>
    <button on:click={() => {
        $stellung = H.convert.n(H.startStellung);
        $amZug = H.Player.X;
        hist.add($stellung, $amZug);
        close();
    }}>Zurück zur Startstellung</button>
    <button on:click={close}>Okay!</button>
</OverlayBase>