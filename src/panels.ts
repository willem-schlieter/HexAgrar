type PanelProperty = "validate" | "indicateAmZug" | "redo" | "indicateZiele";
interface PanelChangeEvent {
    property: PanelProperty,
    value: any
}
type ChangeListener = (event: PanelChangeEvent) => void;

let Panels = {
    values: {
        validate: true,
        indicateAmZug: true,
        indicateZiele: true,
        redo: null,
    } as {
        [index in PanelProperty]: any
    },
    addChangeListener (listener: ChangeListener) {
        this.changeListeners.push(listener);
    },
    removeChangeListener (listener: ChangeListener) {
        let i = this.changeListeners.indexOf(listener);
        if (i) this.changeListeners.splice(i, 1);
    },
    changeListeners: [] as ChangeListener[],
    default () {
        (document.getElementById("lp-validate") as HTMLInputElement).checked = true;
        (document.getElementById("lp-indicateAmZug") as HTMLInputElement).checked = true;
        (document.getElementById("lp-indicateZiele") as HTMLInputElement).checked = true;
    },
    emitChangeEvent (property: PanelProperty, value?: any) {
        Panels.values[property] = value || null;
        this.changeListeners.forEach(l => l({ property, value: value || null }));
    }
};

// Listeners for Checkboxes
(["validate", "indicateZiele", "indicateAmZug"] as PanelProperty[]).forEach(prop => {
    document.getElementById("lp-" + prop)?.addEventListener("change", event => {
        Panels.emitChangeEvent(prop, (event.currentTarget as HTMLInputElement).checked)
    });
});

// Further Listeners
document.getElementById("lp-redo")?.addEventListener("click", () => {
    Panels.emitChangeEvent("redo");
});