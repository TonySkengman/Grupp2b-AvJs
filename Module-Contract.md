# Modulkontrakt

## 1. Modulform

Varje modul ska exportera en klass som default och ha en statisk descriptor.
Descriptorn ska kunna läsas utan att modulen behöver skapas först.
Själva logiken körs sedan på en instans av modulen.

## 2. Felhantering

Om något blir fel ska modulen kasta ett `Error` med ett tydligt felmeddelande som går att visa direkt i React.
Modulen ska inte returnera `undefined` eller bara ignorera fel.

## 3. Valideringsansvar

Formuläret kollar först så att det som skrivs in stämmer med descriptorn, till exempel om ett fält måste fyllas i, vilken typ av värde det ska vara och om det finns min eller max.

Modulen ska ändå inte lita helt på formuläret utan ska kunna hantera felaktig indata själv och kasta ett tydligt fel istället för att krascha.

## 4. Struktur

Varje modul ska ligga i sin egen mapp under:

`src/modules/<namn>/`

`index.js` ska vara den enda publika ingången till modulen.

Modulerna ska bara innehålla vanlig JavaScript och ska inte importera React.

## 5. API-ägarskap

Vi delar upp API:t så att varje modul ansvarar för sin egen endpoint. På så sätt minskar risken att flera moduler ändrar samma data på olika sätt.

| Endpoint | Ägare | Används/läses av |
|---|---|---|
| `/api/products` | Gruppen / React-shoppen | Moduler som behöver produktdata |
| `/api/inventory` | Lagermodulen | React/admin |
| `/api/campaigns` | Kampanjmodulen | React-shoppen |
| `/api/carriers` | Fraktmodulen | React-shoppen |
| `/api/rates` | Valuta/momsmodulen | React-shoppen |
| `/api/orders` | React-shoppen / checkout | Används när en order sparas |
| `/api/points` | Kundklubbsmodulen | React/admin om kundklubben används |

Lagermodulen får läsa produktdata från `/api/products`, men det är `/api/inventory` som används för lagerhändelser och beräkning av lagersaldo.

Fraktmodulen får läsa vikt och mått från produkterna men ansvarar själv för `/api/carriers`.

Valuta/momsmodulen får läsa pris och kategori från produkterna men ansvarar själv för `/api/rates`.

Kampanjmodulen ansvarar för `/api/campaigns` och använder varukorgens data när rabatt ska räknas ut.