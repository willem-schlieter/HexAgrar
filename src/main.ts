let $g: typeof document.querySelector = document.querySelector.bind(document),
    $a: typeof document.querySelectorAll = document.querySelectorAll.bind(document),
    $c: typeof document.createElement = document.createElement.bind(document);
;

Brett.init();
Brett.stellung = new Stellung("012345.uvwxyz");

Panels.addChangeListener(event => {
    if (event.property === "indicateAmZug") Brett.brett?.classList[(event.value) ? "add" : "remove"]("brett_indicateAmZug");
    if (event.property === "indicateZiele") Brett.brett?.classList[(event.value) ? "add" : "remove"]("brett_indicateZiele");
    if (event.property === "redo") Brett.redo();
});

window.addEventListener("keypress", event => {
    if (event.key === "z") Brett.redo();
});

`XXX       XXX
  XXX     XXX
   XXX   XXX
    XXX XXX
     XXXXX
    XXX XXX
   XXX   XXX
  XXX     XXX
 XXX       XXX`;

`   OOOOOOO   
  OOO     OOO
 OOO       OOO
 OOO       OOO
 OOO       OOO
 OOO       OOO
 OOO       OOO
  OOO     OOO
    OOOOOOO   `