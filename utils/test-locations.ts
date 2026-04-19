/**
 * Sdílené GPS konstanty pro testy.
 *
 * Proč modul? GPS hodnoty se opakují napříč fixtures/testy a "Praha-centrum"
 * je implicit assumption pro dispatch distance matching. Konstanta dá tomu
 * jméno + jedno místo pro změnu, kdyby se backend logika změnila.
 */
export const PRAGUE_CENTER = { lat: 50.08, lng: 14.42 } as const;
