- Modulens syfte - 

Fraktmodulen räknar ut fraktofferter från flera transportörer utifrån vad som ligger i varukorgen och vilken destination kunden väljer. Den är byggd som en fristående modul (shipping) som ännu inte är kopplad till resten av projektet. I dagsläget går den att köra och testa isolerat.

- Uppbygnad -

* index.js – modulens publika ingång. Tar emot formulärdata (destination) och varukorgen, bygger ett Parcel och ber ShippingQuoteService om offerter

* Parcel – representerar hela varukorgen som ett paket. Räknar ut total vikt, volym och volymvikt (branschstandard för att stora men lätta paket ska kosta rätt

* PricingStrategies – tre olika prismodeller (WeightBasedPricing, ZoneBasedPricing, VolumetricPricing), var och en med samma metod calculate(). Det gör att man kan lägga till nya prismodeller utan att ändra i Carrier

* Carrier – representerar en transportör. Den äger ingen prislogik själv, utan skickar vidare beräkningen till den prisstrategi den fått in (design-mönstret Strategy). Kastar tydligt fel om transportören inte levererar till vald zon

* ShippingQuoteService – hämtar transportörskonfigurationer från ett API, bygger Carrier-objekt med rätt prisstrategi, cachar dem, och returnerar en sorterad lista med offerter (billigast först)


- Tester -
Varje del testas separat i egna filer under tests/ genom try/catch och console.log som visar ett förväntat resultat samt det faktiska resultatet. ShippingQuoteService-testerna mockar fetch manuellt så att dom inte behöver ett riktigt API. Det finns även en runAllTests.js som kör samtliga testfiler i följd.

Stå i projektroten och kör följande kommandon i terminalen:
node src/modules/shipping/tests/Parcel.test.js
node src/modules/shipping/tests/Carrier.test.js
node src/modules/shipping/tests/PricingStrategies.test.js
node src/modules/shipping/tests/ShippingQuoteService.test.js

Alternativt följande för att köra alla test på en gång:
node src/modules/shipping/tests/runAllTests.js