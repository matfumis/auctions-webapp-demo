# Note

## Collezioni database
1. `users`
2. `auctions`

### Proprietà `users`

```json
"id": "user123", // uso l'id di default?
"name": "zio"
"surname": "pera",
"username": "john_doe",
// "email": "john@example.com", // sarebbe figo implementare un sistema di notifiche
"passwordHash": "hashed_password", // ricorda di implementare l'hash
// "role": "bidder", // bidder, seller o admin
"winningBids": [
        { "auctionId": "auction567", "amount": 100, "timestamp": "2024-11-28T12:30:00Z" }
    ]
```

### Proprietà `auctions`

```json
"_id": "auction567",
"title": "titolo asta/oggetto",
"description": "Descrizione oggetto",
"sellerId": "user123", // riferito all'utente venditore
"startPrice": 0, 
"currentPrice": 0, 
"startTime": "2024-11-27T10:00:00Z",
"endTime": "2024-12-01T10:00:00Z",
"bidsHistory": [
        { "bidderId": "user456", "amount": 0, "timestamp": "2024-11-27T11:00:00Z" },
        { "bidderId": "user789", "amount": 0, "timestamp": "2024-11-28T15:30:00Z" }
        ],
"status": "stato asta", // open, closed
```