# Kampanjmotor

## Syfte

Tar emot en varukorg och en lista kampanjkoder, och räknar ut en
prisspecifikation: { subtotal, discounts, total }. Hanterar tre
kampanjtyper — procentrabatt, tröskelrabatt, "köp X betala Y" — som
kombineras i en fast ordning. Koder valideras asynkront mot
/api/campaigns.

## Klasser och relationer

**Cart** — håller varukorgens rader, kan summera (getSubtotal) och filtrera på kategori (getItemsInCategory). Kastar InvalidCartError vid ogiltig indata.
**Discount** — räknar ut rabatten för en kampanj i taget, utifrån type. Kastar UnknownCampaignTypeError för okänd typ.
**PriceCalculator** — äger stapelordningen (BUY_X_PAY_Y → THRESHOLD → PERCENTAGE) och summerar resultatet. Har en lista Discount-objekt (komposition).
**CampaignModule** (index.js) — modulens enda publika ingång. Default export, statisk descriptor, no-arg-konstruktor, async run(values). Validerar koder mot API:t och bygger prisspecen.
**errors.js** — InvalidCartError, UnknownCampaignCodeError, UnknownCampaignTypeError, alla ärver ModuleError (sätter this.name till subklassens namn).

## Designval

**Komposition** valdes för Discount: en klass med if/else per
kampanjtyp istället för tre subklasser — all logik i en fil, lättare
att läsa, men växer om fler typer tillkommer. PriceCalculator och
CampaignModule bygger vidare på samma komposition-princip: de *har*
andra objekt (en lista Discount, respektive Cart/Discount/
PriceCalculator-instanser), de *är* dem inte. **Arv** används
däremot i errors.js, en äkta "är en"-relation.

## Kontraktsuppfyllnad

Riktigt async-arbete (cachat API-anrop), motiverat instans-tillstånd
(`cachedCampaigns`, `history`), rikare descriptor (regexvalidering +
villkorligt fält), genomarbetad felhantering (tre specifika
felklasser) och enhetstester (`campaign.test.js`, 8 tester) — de tre
sistnämnda är VG-fördjupningar.