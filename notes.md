# Note

## To-Do

- [x] mostrare bottone per fare offerta (o colore diverso) solo per utenti autenticati
- [x] sistemare form offerta
- [x] assegnare vincitore aste
- [ ] mostrare status asta calcolato
    - se asta chiusa, mostrare username utente vincente
- [ ] mostrare prima aste aperte e quelle chiuse
- [ ] espandere dettagli asta
- [ ] decisione su collezione `bids`
- [ ] inserire try-catch backend
- [ ] aggiungere filtro asta (aperta/chiusa)
- [ ] migliorare frontend (bootstrap?)
- [ ] riorganizzare cartelle

## Controllo temporale aste

- Rimuovere attributo `status` dalle aste
    - sarà calcolato e mostrato in frontend, aggiornato a ogni refresh
        - o refresh della pagina o chiamata esplicita di showAuctions con bottone

- Creare middleware da anteporre alla `PUT` dell'asta
    - il middleware chiama next se `auction.endDate - now > 0`, sennò errore

## Collezioni database

1. `users`
2. `auctions`
3. `bids`? Per un unica api che richiede i dettagli di un asta

### Proprietà `users`

```json
"id": 
"name": 
"surname": 
"username": 
"passwordHash": 
"winningBids": [
{"auctionId": , "amount":, "timestamp": }
]
```

### Proprietà `auctions`

```json
"id": ,
"title": ,
"description": ,
"sellerId": , 
"startPrice": ,
"currentPrice": ,
"startTime": ,
"endTime": ,
"bidsHistory": [
{"bidderId": , "amount": , "timestamp": 
},

]
```