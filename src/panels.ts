interface panelChangeEvent {
    property: "validate",
    value: any
}
type changeListener = (event: panelChangeEvent) => void;

let Panels = {
    values: {
        validate: true
    },
    addChangeListener (listener: changeListener) {
        this.changeListeners.push(listener);
    },
    removeChangeListener (listener: changeListener) {
        let i = this.changeListeners.indexOf(listener);
        if (i) this.changeListeners.splice(i, 1);
    },
    changeListeners: [] as changeListener[],
    default () {
        (document.getElementById("lp-valid") as HTMLInputElement).checked = true;
        (document.getElementById("lp-indicateAmZug") as HTMLInputElement).checked = true;
    }
}

document.getElementById("lp-valid")?.addEventListener("change", event => {
    let ev: panelChangeEvent = {
        property: "validate",
        value: Panels.values.validate = (event.currentTarget as HTMLInputElement).checked
    }
    Panels.changeListeners.forEach(l => l(ev));
});
document.getElementById("lp-indicateAmZug")?.addEventListener("change", event => {
    Brett.indicateAmZug = (event.currentTarget as HTMLInputElement).checked;
})