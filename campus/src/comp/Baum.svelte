<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import H from "../core";
    import { ti_hover, ti_before, ti_clicked_id, stellung, amZug } from "../stores";
    import T from "../togre";

    import Baumstamm from "./Baumstamm.svelte";

    export let option: H.Option;
    export let p: H.Player;
    export let root: boolean;
    export let parent: H.Option;
    export let feldnummern: H.FeldFormat;
    export let autocalc: boolean;

    let dispatch = createEventDispatcher();
    let collapsed = !root;

    const id = Math.random();

    $: options = H.getOptions(H.convert.sortByX(option.ziel), p.t);

    let hover = false;
    $: selected = hover || $ti_clicked_id === id;
    $: {
        if (selected) {
            $ti_hover = root ? null : [option, p]; 
            $ti_before = [parent.ziel, p.t];
        }
    }

</script>

<div id="BAUM_ROOT">
    <Baumstamm
        {option}
        {p}
        {id}
        bind:collapsed
        openable={typeof options !== "string"}
        bind:hover={hover}
        display = {{
            p_before: ! root,
            p_after: root,
            pos: root,
            zug: ! root
        }}
        {autocalc}
        on:userzug
        {feldnummern}
    />
    {#if ! collapsed}
        <table><tr>
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <td
                id="margin"
                class:hover={selected}
                on:mouseenter={() => {if ($ti_clicked_id === -1) hover = true;}}
                on:mouseleave={() => hover = false}
                on:click={() => {
                    if ($ti_clicked_id === id) $ti_clicked_id = -1;
                    else $ti_clicked_id = id;
                }}
                on:dblclick={() => {
                    dispatch("userzug", {newpos: option.ziel, newp: p.t})
                }}
            ></td>
            <td id="children__">
                {#if typeof options !== "string"}
                    {#each options as o}
                        <svelte:self
                            option={o}
                            p={p.t}
                            root={false}
                            parent={option}
                            on:userzug
                            {autocalc}
                            {feldnummern}
                        />
                    {/each}
                {/if}
            </td>
        </tr></table>
    {/if}
</div>

<style>
    * {
        box-sizing: border-box;
    }
    table {
        border-collapse: collapse;
        width: 100%;
    }
    #margin {
        width: 30px;
        background-color: #cca;
    }
    #margin.hover {
        background-color: #886;
    }
</style>