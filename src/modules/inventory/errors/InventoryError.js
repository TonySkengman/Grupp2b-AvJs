// Alla lagerfel utgår från den här klassen.
export class InventoryError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InventoryError';
  }
}

// Används vid ogiltig typ eller antal i en lagerhändelse.
export class InvalidStockMovementError  extends InventoryError {
  constructor(message) {
    super(message);
    this.name = 'InvalidStockMovementError';
  }
}

// Används när en produkt saknas.
export class StockItemNotFoundError extends InventoryError {
  constructor(message) {
    super(message);
    this.name = 'StockItemNotFoundError';
  }
}


// Används när lager-API:t inte går att nå eller svarar med fel.
export class InventoryApiError extends InventoryError {
  constructor(message = "Det gick inte att kommunicera med lager-API:t") {
    super(message);
    this.name = 'InventoryApiError';
  }
}
