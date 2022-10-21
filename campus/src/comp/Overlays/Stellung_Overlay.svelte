<script lang="ts">
    import OverlayBase from "./OverlayBase.svelte";
    
    import H from "../../core";
    import { amZug, hist, overlay, stellung } from "../../stores";
    import { onMount } from "svelte";

    onMount(() => {input.focus(); input.select();});

    function anwenden () {
        if (!value.match(H.codePattern)) return false;
        $stellung = H.convert.n(value);
        $overlay = "none";
        hist.add($stellung, $amZug);
        // $hist.unshift({
        //     stellung: H.convert.c($stellung),
        //     amZug: $amZug
        // });
    }

    let value = H.convert.c($stellung);
    let input: HTMLInputElement;

    function handleInput () {
        if (value.includes("-")) {
            value = "012345.uvwxyz";
        } else {
            // nicht-valide Zeichen Löschen
            let schonEnthalten = [] as string[];
            value = value.split("").filter((c, i) => {
                if (c.match(/[a-z\d\.]/i)) {
                    if (schonEnthalten.includes(c)) return false;
                    else return !!schonEnthalten.push(c)
                } else return false;
            }).join("");
        }
    }


</script>

<OverlayBase width={500} on:enter={anwenden}>
    <h2>Stellungseingabe</h2>

    <h4>Aktuell: {H.convert.c($stellung)}</h4>

    <span>Eingabe:</span>
    <input bind:this={input} type="text" bind:value on:input={handleInput}>

    <button on:click={anwenden} disabled={!value.match(H.codePattern)}>Anwenden</button>


</OverlayBase>