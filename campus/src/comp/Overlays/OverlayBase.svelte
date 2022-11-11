<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { fade, fly } from "svelte/transition";
    import { overlay } from "../../stores";
    
    export let width: number | string = "max";
    const dispatch = createEventDispatcher();

</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
    id="bg"
    transition:fade={{duration: 200}}
    on:click={() => ($overlay = "none")}
></div>
<button
    on:click={() => ($overlay = "none")}
    transition:fade={{duration: 100}}
>Schließen</button>
<div
    style="width:{(typeof width === "number") ? (width + "px") : ((width === "max") ? "calc(100% - 200px)" : width)}"
    id="content"
    transition:fly={{y: -40, duration: 200}}
>
    <slot></slot>
</div>

<svelte:window on:keyup={event => {
    if (event.key === "Escape") $overlay = "none";
    else if (event.key === "Enter") dispatch("enter", {});
}}></svelte:window>


<style>
    #bg {
        position: fixed;
        top: 45px; bottom: 0;
        left: 0; right: 0;
        z-index: 100;
        background-color: #966e;
        /* display: none; */
    }
    #content {
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translate(-50%, 0);
        z-index: 101;
        padding: 20px;
        max-height: calc(100% - 120px);

        overflow: scroll;

        background-color: #777;
        color: #fff;
        border: 1px solid #222;
        border-radius: 10px;
        box-shadow: 3px -3px 3px 0 #555;
    }
    button {
        position: fixed;
        top: 45px; right: 0;
        z-index: 101;
        background-color: #ec4545;
        color: white;
    }

</style>