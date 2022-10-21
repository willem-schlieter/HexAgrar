// @ts-ignore
import App from './comp/App.svelte';


import H from "./core";
import T from "./togre";
import gener from "./halbkreis";
import { bestFraction } from './auto';

(window as any).H = H;
(window as any).T = T;
(window as any).gener = gener;
(window as any).bestFraction = bestFraction;

// Search Params auswerten
import {stellung, amZug} from "./stores";
const sp = new URL(document.location.href).searchParams;
if (sp.get("s")) stellung.set(H.convert.n(sp.get("s")));
const p = sp.get("p"); if (p) {
	if (p === "X") amZug.set(H.Player.X);
	if (p === "O") amZug.set(H.Player.O);
}

const app = new App({
	target: document.body
});

export default app;