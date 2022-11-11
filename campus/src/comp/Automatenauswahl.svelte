<script lang="ts">
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    import type { Autocode } from "../auto";
    import { info, autocodes } from "../auto";
    import { auto_auto, auto_O, auto_wait, auto_working, auto_X, overlay, state } from "../stores";

    function requestAutoCheck () {
        dispatch("autoCheck");
    }

    let timeout = setTimeout(() => {});
    clearTimeout(timeout);
    function checkWartezeit () {
        if (wartezeit.value === "") {
            timeout = setTimeout(() => {
                $auto_wait = 0;
                wartezeit.value = String($auto_wait);
            }, 2000);
            return;
        }
        else {
            if (timeout) clearTimeout(timeout);
            wartezeit.value = wartezeit.value.split("").filter(c => c.match(/[\d]/)).join("");
            // if (! Number(wartezeit.value)) wartezeit.value = "1";
        }
        $auto_wait = Number(wartezeit.value);
    }

    let wartezeit: HTMLInputElement;

    function blur (event: Event) {
        (<HTMLElement>event.target).blur();
    }
</script>

<h2>Automatenauswahl</h2>

<img src="./img/FigX.png" width="30" alt="Spieler X: ">
<select disabled={$state === "aktiv"} bind:value={$auto_X} on:input={blur}>
    <option value="">— Kein Automat —</option>
    {#each autocodes as c}
        {#if info[c].display}
            <option value={c} title={info[c].title}>{c}</option>
        {/if}
    {/each}
</select>
<button disabled={$state === "aktiv" || ! $auto_X} class="info" on:click={() => $overlay = "auto_info_x"}>i</button>
<br>

<img src="./img/FigO.png" width="30" alt="Spieler O: ">
<select disabled={$state === "aktiv"} bind:value={$auto_O} on:input={blur}>
    <option value="">— Kein Automat —</option>
    {#each autocodes as c}
        {#if info[c].display}
            <option value={c} title={info[c].title}>{c}</option>
        {/if}
    {/each}
</select>
<button disabled={$state === "aktiv" || ! $auto_O} class="info" on:click={() => $overlay = "auto_info_o"}>i</button>
<br><hr>

<!-- Wartezeit: <input bind:this={wartezeit} disabled={$state === "aktiv"} type="number" min={1} step={1} bind:value={$auto_wait} style="width: 70px;" on:input={checkWartezeit}><br> -->
Wartezeit: <input type="text" value="0" bind:this={wartezeit} disabled={$state === "aktiv"} style="width: 70px;" on:input={checkWartezeit}>

<label title="Wenn deaktiviert, müssen Automaten mithilfe des untenstehenden Buttons manuell aufgerufen werden.">
    <input type="checkbox" bind:checked={$auto_auto}> Automatisch ziehen
</label>

{#if $state !== "aktiv"}
<button
    on:click={requestAutoCheck}
    title="Durch Klicken zieht der Automat, der für den ziehenden Spieler ausgewählt wurde."
>Automaten jetzt ziehen lassen</button>
<button on:click={() => $overlay = "timing_info"} title="Erklärung dieser beiden Elemente">?</button>
{/if}

<style>
    select {
        width: 75%;
        max-width: 200px;
    }
    img {
        transform: translateY(9px);
    }
</style>