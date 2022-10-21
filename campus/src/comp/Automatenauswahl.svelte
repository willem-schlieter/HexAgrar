<script lang="ts">
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    import type { Autocode } from "../auto";
    import { info, autocodes } from "../auto";
    import { auto_auto, auto_O, auto_wait, auto_working, auto_X, overlay, state } from "../stores";
    import OverlayBase from "./Overlays/OverlayBase.svelte";

    function requestAutoCheck () {
        dispatch("autoCheck");
    }

    let autos = {
        x: "" as "" | Autocode,
        o: "" as "" | Autocode
    }

    let visibleInfo = "X";

    function showInfo (playercode: string) {
        if (playercode === "X" && ! $auto_X) return;
        else if (playercode === "O" && ! $auto_O) return;
        else {
            $overlay = "auto_info";
            visibleInfo = playercode;
        }
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

<!-- {#each ["x", "o"] as playercode}
    <h4>Für Spieler {playercode.toUpperCase()}:</h4>
    <select bind:value={autos[playercode]}>
        <option value="">–– Kein Automat ––</option>
        {#each autocodes as c}
            <option value={c} title={info[c].title}>{c}</option>
        {/each}
    </select>
    <button disabled={! autos[playercode]} class="info" on:click={() => showInfo(playercode)}>i</button>
    <br>
{/each} -->

<h4>Für Spieler X:</h4>
<select disabled={$state === "aktiv"} bind:value={$auto_X} on:input={blur}>
    <option value="">— Kein Automat —</option>
    {#each autocodes as c}
        {#if info[c].display}
            <option value={c} title={info[c].title}>{c}</option>
        {/if}
    {/each}
</select>
<button disabled={$state === "aktiv" || ! $auto_X} class="info" on:click={() => showInfo("X")}>i</button>
<br>

<h4>Für Spieler O:</h4>
<select disabled={$state === "aktiv"} bind:value={$auto_O} on:input={blur}>
    <option value="">— Kein Automat —</option>
    {#each autocodes as c}
        {#if info[c].display}
            <option value={c} title={info[c].title}>{c}</option>
        {/if}
    {/each}
</select>
<button disabled={$state === "aktiv" || ! $auto_O} class="info" on:click={() => showInfo("O")}>i</button>
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


{#if $overlay === "auto_info"}
    <OverlayBase>
        {#if visibleInfo === "X"}
            <h3>Automateninformationen: <code>{$auto_X}</code></h3>
            <h1>{info[$auto_X].title}</h1>
            <p>{info[$auto_X].description}</p>
        {:else}
            <h3>Automateninformationen: <code>{$auto_O}</code></h3>
            <h1>{info[$auto_O].title}</h1>
            <p>{info[$auto_O].description}</p>
        {/if}
    </OverlayBase>
{/if}

{#if $overlay === "timing_info"}
    <OverlayBase width="max">
        <h3>Wie läuft das Timing der Automaten ab...</h3>
        <h5>... und was haben die Einstellung "Automatisch ziehen" und der Button "Automaten jetzt ziehen lassen" zu bedeuten?</h5>
        <p>
            Es gibt drei Ereignisse, auf die ein Automat reagiert:
        </p>
        <ul>
            <li>Du hast gezogen.</li>
            <li>Ein anderer Automat hat gezogen.</li>
            <li>Der Button "Automaten jetzt ziehen lassen" wurde angeklickt.</li>
        </ul>
        <p>
            Tritt eines dieser drei Ereignisse ein, so zieht, wenn für den Spieler, der nun am Zug ist, ein Automat angegeben ist, dieser Automat.<br>
            Wenn du also gegen einen Automaten spielst, zieht dieser immer, nachdem du gezogen hast – er reagiert automatisch. Wenn zwei Automaten gegeneinander antreten, so reagieren diese gegenseitig auf ihre Züge, und du kannst den Automaten faul beim Spielen zusehen, ohne etwas machen zu müssen...<br><br>
            Wenn du das nicht willst, klicke oben die Option "Automatisch ziehen" ab. Dann reagieren Automaten weder auf deine Züge, noch auf Züge anderer Automaten. Um sie zum Ziehen zu bringen, hilft nur noch eines: Der Button "Automaten jetzt ziehen lassen". Wenn du also gegen einen Automaten spielst, müsstest du nach jedem deiner Züge den Button klicken, damit der Automat handelt. Willst du das wirklich? Lass die Option doch lieber angeklickt!<br><br>
            (Der Button ist übrigens auch in anderen Situationen sinnvoll, zum Beispiel wenn du ein neues Spiel startest, und der Automat den ersten Zug machen soll.)
        </p>
            
    </OverlayBase>
{/if}

<style>
    select {
        width: 80%;
    }
</style>