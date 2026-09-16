# Valuta- och momsmodul

## Syfte

Modulens syfte är att hantera momsberäkning och valutakonvertering för webbshoppen. Modulen tar emot rader från varukorgen, lägger på rätt svensk moms beroende på produktens momskategori och konverterar därefter beloppet till den valuta användaren har valt.

Modulen stödjer SEK, EUR och USD. Valutakurser hämtas asynkront från `/api/rates` och cachas mellan anrop så att samma data inte behöver hämtas flera gånger.

## Klassernas roller och relationer

`CurrencyModule` är modulens publika ingång och samordnar hela flödet. Den tar emot vald valuta och `cartLines`, validerar datan, räknar ut radbelopp och använder de andra klasserna för moms och valutakonvertering.

`TaxCalculator` ansvarar endast för momslogiken. Den innehåller de svenska momssatser som modulen stödjer: 25 % för standardvaror, 12 % för livsmedel och 6 % för böcker.

`CurrencyConverter` ansvarar för valutakurser och valutakonvertering. Den hämtar kurser från API:t, validerar dem, sparar dem i en cache och konverterar belopp mellan de valutor som modulen stödjer.

Modulen innehåller även egna felklasser: `CurrencyModuleError`, `ValidationError`, `TaxError` och `ExchangeRateError`. De används för att skilja mellan olika typer av fel och ge begripliga felmeddelanden som kan visas direkt i React.

## Designval

Jag har valt komposition mellan huvudklasserna. `CurrencyModule` skapar och använder instanser av `TaxCalculator` och `CurrencyConverter` istället för att ärva från dem. Det passar bättre eftersom klasserna har olika ansvar och inte har något naturligt "är en"-förhållande.

För felhanteringen används däremot arv. `ValidationError`, `TaxError` och `ExchangeRateError` ärver från `CurrencyModuleError`, som i sin tur ärver från JavaScripts `Error`. På så sätt kan modulen både skilja mellan olika feltyper och fortfarande hantera dem som vanliga JavaScript-fel.

`CurrencyConverter` behåller valutakurser i instansvariabeln `this.rates`. Det är ett motiverat state eftersom valutakurserna kan återanvändas mellan flera anrop och API:t därför inte behöver kontaktas varje gång.

## Enhetstester

Modulens centrala logik testas med Node.js inbyggda testverktyg `node:test` och `node:assert/strict`.

Tester finns för:

- momsberäkning för 25 %, 12 % och 6 %
- validering av ogiltiga belopp
- valutakonvertering mellan SEK, EUR och USD
- API- och nätverksfel
- ogiltiga och saknade valutakurser
- kontroll att SEK har basvärdet 1
- cache av valutakurser
- hela flödet genom `CurrencyModule.run()`
- egna felklasser och begripliga felmeddelanden

Testfilerna finns i:

```text
src/modules/currency-tax/tests/