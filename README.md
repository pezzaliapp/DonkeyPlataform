# Donkey Platform — PWA (pezzaliAPP)

Un piccolo platform ispirato a *Donkey Kong (1981)*: sali le piattaforme, evita i barili, raggiungi la piattaforma dorata per passare il livello.

## Comandi
- **Desktop**: Frecce ◀︎▶︎ per muoverti, **Z** per saltare, **▲▼** per salire/scendere le scale, **Space/Enter** per Pausa.
- **Mobile**: usa i pulsanti touch sotto al canvas.

## Struttura
```
/DonkeyKongPWA-v1
  index.html
  manifest.json
  service-worker.js
  /js/game.js
  /icons/icon-192.png
  /icons/icon-512.png
```

## PWA
- Installabile (Aggiungi alla Home su iOS/Android, “Installa app” su desktop).
- **Offline-ready** grazie al `service-worker.js` (cache-first).

## Note legali
Ispirato a meccaniche arcade del 1981; non usa asset o marchi registrati di terze parti. MIT License.
