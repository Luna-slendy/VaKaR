# React + Vite

Šī veidne nodrošina minimālu React un Vite konfigurāciju ar karsto moduļu
pārlādi (HMR) un dažiem Oxlint noteikumiem.

Ir pieejami divi oficiāli spraudņi:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) izmanto [Oxc](https://oxc.rs).
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) izmanto [SWC](https://swc.rs/).

## React kompilators

Šajā veidnē React kompilators nav ieslēgts, jo tas ietekmē izstrādes un
būvēšanas veiktspēju. Tā pievienošana ir aprakstīta
[React dokumentācijā](https://react.dev/learn/react-compiler/installation).

## Oxlint konfigurācijas paplašināšana

Lietotnei, kas paredzēta publicēšanai, ieteicams izmantot TypeScript un ieslēgt
pārbaudes, kas ņem vērā datu tipus. Informāciju par TypeScript un attiecīgo Oxlint
noteikumu pievienošanu projektam skatiet
[TypeScript veidnē](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts).
