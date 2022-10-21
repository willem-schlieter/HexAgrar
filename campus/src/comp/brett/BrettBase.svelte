<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import H from "../../core";
    import { view, vorschlagRechnen } from "../../stores";
    
    const dispatch = createEventDispatcher();

    export let stellung: H.Numpos = [[0, 1, 2, 3, 4, 5], [30, 31, 32, 33, 34, 35]];
    export let xAmZug = true;
    export let oAmZug = true;
    export let selected = -1;
    export let vorschlag = true;
    export let classic = true;
    export let size = 400;
    export let hover = -1;
    export let disabled = false;
    export let feldnummern: "alnum" | "num" | "coord" | "chess" | "" = "alnum";
    export let turn = false;

    $: selectedPlayer = H.playerAufFeld(stellung, selected);
    $: vorschlaege = ($vorschlagRechnen && selected + 1) ? H.zielfelder(stellung, selected, selectedPlayer) : [];
    
</script>

<div id="brett__" class:disabled={disabled} style="width: {size}px; height: {size}px;" class:turn={turn}>
    {#each [...Array(36).keys()] as feldindex}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
            class:feld={true}
            class:feldDark={feldindex % 2 === ((((feldindex - (feldindex % 6)) / 2) % 2) ? 0 : 1)}
            class:feldSelected={selected === feldindex}
            class:feldX={stellung[0].includes(feldindex)}
            class:feldO={stellung[1].includes(feldindex)}
            class:feldAmZug={(stellung[0].includes(feldindex) && xAmZug) || (stellung[1].includes(feldindex) && oAmZug)}
            class:vorschlag={vorschlag && vorschlaege.includes(feldindex)}
            on:click={() => dispatch('feldclick', { feldindex: feldindex })}
            on:mouseenter={() => hover = feldindex}
            on:mouseleave={() => hover = -1}
        >
            {#if $view !== "std"}
                {(function(){
                    const f = H.fconvert(feldindex);
                    switch (feldnummern) {
                        case "alnum": return f.alnum;
                        case "coord": return f.x + "x" + f.y;
                        case "chess": return f.chess_format;
                        case "num": return f.dez;
                        default: return "";
                    }
                })()}
            {/if}
        </div>
    {/each}
</div>


<svelte:head>
    <link rel="stylesheet" href="./styles/brett/general.css">
    {#if !classic}
        <link rel="stylesheet" href="./styles/brett/modernTheme.css">
    {/if}
</svelte:head>