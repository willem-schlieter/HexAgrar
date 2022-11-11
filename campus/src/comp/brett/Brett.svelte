<script lang="ts">
    import {createEventDispatcher} from "svelte";
    const dispatch = createEventDispatcher();
    import H from "../../core";
    import { final, hist, state, validate } from "../../stores";
    import BrettBase from "./BrettBase.svelte"

    export let stellung: H.Numpos;
    export let amZug: H.Player;
    export let size = 400;
    export let feldnummern: "alnum" | "num" | "coord" | "chess" | "" = "alnum";
    export let turn = false;
    export let selected = -1;
    export let hover = -1;
    export let emph: {
        blurred?: Array<number>,
        green?: Array<number>,
        lastTarget?: number
    };
    export let disabled: boolean;

    hist.add(stellung, amZug);

    $: selectedPlayer = H.playerAufFeld(stellung, selected)!;
    $: vorschlaege = (selected + 1) ? H.zielfelder(stellung, selected, selectedPlayer) : [];

    function canSelect (stellung: H.Numpos, feldindex: number): boolean {
        return (amZug === H.playerAufFeld(stellung, feldindex));
    }

    function clickHandler (feldindex: number) {
        if (disabled) return;
        if (selected === feldindex) selected = -1;
        else if (selected + 1) {
            if ($validate && ((stellung[0].includes(selected) && stellung[0].includes(feldindex)) || (stellung[1].includes(selected) && stellung[1].includes(feldindex)))) selected = feldindex;
            else if ($validate && ! H.zielfelder(stellung, selected, selectedPlayer).includes(feldindex)) {
                console.warn("Der ausgewählte Zug ist unzulässig und wird ignoriert. Um ungültige Züge zu erlauben, wechsele in die Entwickler- oder Programmiereransicht und deaktiviere 'Ungültige Züge sperren'.");
            } else {
                // stellung = H.numposZiehen(stellung, selected, feldindex, selectedPlayer);
                // amZug = amZug.t;
                let detail = {
                    newpos: H.numposZiehen(stellung, selected, feldindex, selectedPlayer),
                    newp: amZug.t
                };
                selected = -1;
                dispatch("userzug", detail);
                // hist.add(stellung, amZug);
            }
        } else {
            if (canSelect(stellung, feldindex)) selected = feldindex;
            else console.debug("Feld konnte nicht ausgewählt werden.");
        }
    }

    export function undo (): void {
        hist.undo();
    }

</script>

<BrettBase
    stellung = {stellung}
    bind:selected
    xAmZug = {amZug.x}
    oAmZug = {amZug.o}
    
    {size}
    bind:hover
    {disabled}
    {feldnummern}
    {turn}
    emph = {{
        rounded: [selected, ...vorschlaege],
        blurred: emph.blurred,
        green: emph.green,
        lastTarget: emph.lastTarget
    }}

    on:feldclick = {e => clickHandler(e.detail.feldindex)}
/>

