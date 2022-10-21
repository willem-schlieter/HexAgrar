<script lang="ts">
    import {createEventDispatcher} from "svelte";
    const dispatch = createEventDispatcher();
    import H from "../../core";
    import { stellung, amZug, final, hist, auto_X, auto_O, state, validate } from "../../stores";
    import BrettBase from "./BrettBase.svelte"

    // export let stellung: H.Numpos = [[0, 1, 2, 3, 4, 5], [30, 31, 32, 33, 34, 35]];
    // export let amZug: H.Player = H.Player.X;
    export let selected = -1;
    export let vorschlag: boolean = true;
    export let classic = true;
    export let size = 400;
    export let hover = -1;
    export let feldnummern: "alnum" | "num" | "coord" | "chess" | "" = "alnum";
    export let turn = false;

    $: disabled = !! $final || ($state === "aktiv");

    hist.add($stellung, $amZug);

    $: selectedPlayer = H.playerAufFeld($stellung, selected);

    function canSelect (stellung: H.Numpos, feldindex: number): boolean {
        return ($amZug === H.playerAufFeld(stellung, feldindex));
    }

    function clickHandler (feldindex: number) {
        if (disabled) return;
        if (selected === feldindex) selected = -1;
        else if (selected + 1) {
            if ($validate && (($stellung[0].includes(selected) && $stellung[0].includes(feldindex)) || ($stellung[1].includes(selected) && $stellung[1].includes(feldindex)))) selected = feldindex;
            else if ($validate && ! H.zielfelder($stellung, selected, selectedPlayer).includes(feldindex)) {
                console.warn("Der ausgewählte Zug ist unzulässig und wird ignoriert. Um ungültige Züge zu erlauben, wechsele in die Entwickler- oder Programmiereransicht und deaktiviere 'Ungültige Züge sperren'.");
            } else {
                $stellung = H.numposZiehen($stellung, selected, feldindex, selectedPlayer);
                $amZug = $amZug.t;
                selected = -1;
                hist.add($stellung, $amZug);
                dispatch("userzug");
            }
        } else {
            if (canSelect($stellung, feldindex)) selected = feldindex;
            else console.debug("Feld konnte nicht ausgewählt werden.");
        }
    }

    export function undo (): void {
        hist.undo();
    }

</script>

<BrettBase
    stellung = {$stellung}
    {vorschlag}
    bind:hover
    {classic}
    {size}
    xAmZug = {$amZug.x}
    oAmZug = {$amZug.o}
    bind:selected
    on:feldclick = {e => clickHandler(e.detail.feldindex)}
    {disabled}
    {feldnummern}
    {turn}
/>

