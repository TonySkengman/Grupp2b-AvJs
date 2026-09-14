# Inventory module

Inventory-modulen hanterar lagersaldo och lagerhändelser för produkterna i webbshoppen.

Modulen använder tre huvudklasser:

- `StockMovement` representerar en lagerhändelse. Det kan vara inleverans, försäljning eller justering. Klassen räknar ut hur händelsen ska påverka lagersaldot.
- `StockItem` representerar lagerinformationen för en produkt. Den hanterar bland annat beställningspunkt, försäljningstakt och om lagret börjar bli lågt.
- `InventoryService` sköter kommunikationen med `/api/inventory` och använder `StockMovement` och `StockItem` för att räkna ut lagersaldo och skapa lagerrapporter.

Klasserna använder composition istället för inheritance. `InventoryService` skapar och använder objekt av `StockMovement` och `StockItem` istället för att klasserna ärver från varandra. Det passar bättre eftersom de har olika ansvar men behöver samarbeta.

Lagerhändelser hämtas och sparas asynkront med `fetch` mot `/api/inventory`. Modulen sparar även hämtade lagerhändelser och den senaste lagerrapporten som state i `InventoryService`.

Felaktiga lagerhändelser eller problem med API:t hanteras med egna felklasser i `errors/InventoryError.js`.

Det finns även tester för bland annat inleverans, försäljning, justering, beräkning av lagersaldo, låg lagernivå och felaktiga lagerhändelser.