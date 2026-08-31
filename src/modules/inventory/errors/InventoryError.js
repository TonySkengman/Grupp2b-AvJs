// Grundfel för lagerdelen.
//Alla våra egna lagerfel bygger vidare på den här.
export class InventoryError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InventoryError';
  }
}

//Används när något är fel med lagerhändelse
// t.ex fel typ eller ogiltigt antal.
export class InvalidStockMovementError  extends InventoryError {
  constructor(message) {
    super(message);
    this.name = 'InvalidStockMovementError';
  }
}

// Används om en produkt inte finns i lagret.
export class StockItemNotFoundError extends InventoryError {
  constructor(message) {
    super(message);
    this.name = 'StockItemNotFoundError';
  }
}   


// Används om något går fel när vi hämtar eller sparar lagerdata.
export class InventoryApiError extends InventoryError {
  constructor(message = "Det gick inte att kommunicera med lager-API:t") {
    super(message);
    this.name = 'InventoryApiError';
    }
}