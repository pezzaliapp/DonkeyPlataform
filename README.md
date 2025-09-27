# Donkey Kong — pezzaliAPP

Un progetto open-source ispirato al classico arcade del 1981, ricreato in **JavaScript puro** con un approccio a classi.  
Giocabile come **programma nativo per Laptop**, e in fase di sviluppo l’adattamento per **iOS e Android** (smartphone e tablet) come app installabile.

👉 [pezzaliAPP.com](https://www.pezzaliAPP.com)

---

## 🎮 Controlli attuali (Laptop)
- **Muovi:** W A S D  
- **Salto:** SPACE  
- **Pausa:** P  
- **Seleziona personaggio:** ENTER  

Su dispositivi mobili i controlli touch sono in fase di sviluppo.

---

## 📸 Screenshot

### Selezione personaggio
![image](https://github.com/Jspanglez/DKJS/assets/98091691/8c84f515-f3ac-410c-8819-7c78784bca29)

### Primo livello
![image](https://github.com/Jspanglez/DKJS/assets/98091691/f0f4516f-4986-4425-a422-2d4b09404403)

### Menu Pausa
![image](https://github.com/Jspanglez/DKJS/assets/98091691/61e96215-7db8-4abc-8d27-829026f534a0)

### Salto sopra un barile
![image](https://github.com/Jspanglez/DKJS/assets/98091691/df648af7-af90-4158-a988-3af8a9f7f380)

---

## 🔧 Struttura del progetto
Il gioco è organizzato in più classi JavaScript:
- **Mario / Luigi** → gestione giocatore
- **DK** → animazioni del gorilla
- **Barrel** → logica dei barili
- **Platform** → piattaforme e inclinazioni
- **Ladder** → scale
- **main.js** → ciclo principale del gioco e gestione stati

Questo approccio a oggetti rende più semplice l’estensione futura e l’adattamento a piattaforme mobile.

---

## 🚀 Roadmap
- [x] Versione funzionante per Laptop
- [ ] Controlli touch per smartphone
- [ ] Packaging come PWA installabile su iOS/Android
- [ ] Supporto audio e vibrazione per mobile

---

## 📜 Licenza
© 2025 pezzaliAPP — Open source.  
Distribuito sotto licenza MIT: puoi studiare, modificare e condividere il codice liberamente, a patto di mantenere questa nota di licenza.
