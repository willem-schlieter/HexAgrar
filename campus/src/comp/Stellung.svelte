<script lang="ts">
    import H from "../core";
    import { overlay } from "../stores";
    export let stellung: H.Numpos;
    let height: number;
</script>

<span title="Stellung">
    {H.convert.c(stellung)}
</span>

<style>
    span {
        display: inline-block;
        height: 100%;
        width: 100%;
    }
</style>