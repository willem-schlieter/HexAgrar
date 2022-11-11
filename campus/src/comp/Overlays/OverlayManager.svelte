<script lang="ts">
    import { info } from "../../auto";
    import { overlay, auto_X, auto_O, final } from "../../stores";

    import OverlayBase from "./OverlayBase.svelte";
    import StellungOverlay from "./StellungOverlay.svelte";
    import FinalOverlay from "./FinalOverlay.svelte";
    import Automatenauswahl from "../Automatenauswahl.svelte";
</script>


{#if $overlay === "test"}
    <OverlayBase width={500} >
        Test-Overlay
        <input type="text">
    </OverlayBase>
{/if}
{#if $overlay === "stellung"}
    <StellungOverlay/>
{/if}
{#if $overlay === "final"}
    <FinalOverlay final = {$final} ></FinalOverlay>
{/if}
{#if $overlay === "auto"}
    <OverlayBase width={303}>
        <Automatenauswahl on:autoCheck />
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
{#if $overlay === "auto_info_x"}
    <OverlayBase>
        <h3>Automateninformationen: <code>{$auto_X}</code></h3>
        <h1>{info[$auto_X].title}</h1>
        <p>{info[$auto_X].description}</p>
    </OverlayBase>
{/if}
{#if $overlay === "auto_info_o"}
    <OverlayBase>
        <h3>Automateninformationen: <code>{$auto_O}</code></h3>
        <h1>{info[$auto_O].title}</h1>
        <p>{info[$auto_O].description}</p>
    </OverlayBase>
{/if}