let $g: typeof document.querySelector = document.querySelector.bind(document),
    $a: typeof document.querySelectorAll = document.querySelectorAll.bind(document),
    $c: typeof document.createElement = document.createElement.bind(document);
;

class Player {
    static X = new Player(true);
    static O = new Player(false);
    static toggle (player: Player): Player {
        return (player.x) ? Player.O : Player.X;
    }

    constructor(x: boolean) {
        this.o = !(this.x = x);
        this.code = (x) ? "x" : "o";
    }

    readonly x: boolean;
    readonly o: boolean;
    readonly code: "x" | "o";
}

Brett.init();
Brett.stellung = new Stellung("012345.uvwxyz");


document.getElementById("lp-back")!.onclick = function() {
    if (Hist.length < 2) console.log("Rückgängig: Bin schon ganz am Anfang.")
    else {
        console.log("Rückgängig.")
        Hist.shift();
        Brett.stellung = Hist.shift()!;
        Brett.amZug = Player.toggle(Brett.amZug);
    }
}
window.addEventListener("keypress", event => {
    if (event.key === "z") document.getElementById("lp-back")?.click();
});


// Panels.addChangeListener((event) => {
    // if (event.property === "validate") Brett.indicateAmZug = event.value;
// });