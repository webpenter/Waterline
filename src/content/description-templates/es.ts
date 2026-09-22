// §13.9: borrador automático pendiente de revisión nativa — ver /docs/translation-review.md
import type { LocaleTemplates } from './types';

export const es: LocaleTemplates = {
  openingByType: {
    villa: [
      'Una villa frente al agua donde el jardín termina en la propia orilla.',
      'Esta villa se asienta sobre la línea de agua, con la orilla a unos pasos.',
      'Una villa luminosa construida alrededor de su frente de agua, no de una vista.',
      'Una villa privada con un raro tramo de orilla en propiedad.',
    ],
    estate: [
      'Una finca frente al agua de verdadera escala, con orilla propia tras sus puertas.',
      'Una finca consolidada cuyos terrenos llegan sin interrupción hasta el agua.',
      'Una finca donde la orilla forma parte del título, no del paisaje.',
    ],
    private_island: [
      'Una isla privada completa, vendida con cada metro de su costa.',
      'Una isla en propiedad única: el agua no es el límite, es la dirección.',
      'Una isla autosuficiente a la que solo se llega en barco.',
    ],
    boathouse: [
      'Un embarcadero rehabilitado donde empieza el agua, con botadura directa desde el nivel inferior.',
      'Una auténtica casa-embarcadero: el agua está bajo el edificio, no más allá del jardín.',
    ],
    _: [
      'Una casa frente al agua cuya orilla pertenece al título de propiedad.',
      'Una propiedad organizada por completo en torno a su acceso directo al agua.',
      'Un acceso directo poco común en un mercado que vende sobre todo vistas.',
    ],
  },
  positioning: [
    'Se alza en una posición tranquila de {locality}, mirando a aguas abiertas.',
    'El entorno es {locality} en su versión más serena, lejos de las vías de paso.',
    'Ocupa una de las últimas posiciones de primera línea de {locality}.',
    'La propiedad se asienta a ras de agua en un tramo protegido de {locality}.',
  ],
  waterSentence: [
    'La propiedad posee {frontage} metros de frente privado al {waterBody}, con orilla de {beachType} a la que se llega desde el jardín.',
    'Son {frontage} metros de orilla en propiedad sobre el {waterBody}, de {beachType} y totalmente privados.',
    'Su frente de {frontage} metros al {waterBody} es lo esencial: orilla de {beachType}, acceso por el césped.',
    '{frontage} metros de línea de agua sobre el {waterBody} constan en el título, con orilla de {beachType} bajo la terraza.',
  ],
  waterSentenceNoFrontage: [
    'El acceso al {waterBody} es directo mediante {access}, con la lámina de agua prácticamente en el lindero.',
    'Al {waterBody} se llega de inmediato a través de {access}, sin carretera ni interrupciones.',
    'El acceso al agua se realiza por {access}, directamente sobre el {waterBody}.',
  ],
  accommodationSentence: [
    'En el interior, {bedrooms} dormitorios y {bathrooms} baños sobre {builtArea} m².',
    'La casa ofrece {builtArea} m² distribuidos en {bedrooms} dormitorios y {bathrooms} baños.',
    'La superficie construida es de {builtArea} m² — {bedrooms} dormitorios, {bathrooms} baños y salones orientados al agua.',
    '{bedrooms} dormitorios y {bathrooms} baños ocupan {builtArea} m², casi todos con el agua delante.',
  ],
  outdoorSentence: [
    'En el exterior, {terrace} m² de terrazas descienden hacia la orilla en una parcela de {plotArea} m².',
    'La parcela de {plotArea} m² está trazada para mantener el agua a la vista, con {terrace} m² de terrazas.',
    'Un jardín de {plotArea} m² rodea la casa; la terraza principal de {terrace} m² mira al agua.',
  ],
  nauticalSentence: [
    'El amarre admite un barco de hasta {loa} metros, con {depth} metros de calado junto al muelle.',
    'Barcos de hasta {loa} m atracan en {depth} m de agua: llegar por mar es la entrada prevista.',
    'Amarre privado para una eslora de hasta {loa} metros en {depth} metros de fondo.',
  ],
  locationSentence: [
    '{marina} queda a {marinaKm} km para combustible, servicio e invernaje.',
    'El puerto deportivo más cercano, {marina}, está a {marinaKm} km por agua.',
    'Para la náutica del día a día, {marina} está a {marinaKm} km de la propiedad.',
  ],
  closingByTier: {
    standard: [
      'Una entrada realista a la verdadera propiedad frente al agua en {destination}.',
      'Una de las opciones más asequibles con acceso directo al agua hoy en {destination}.',
    ],
    premium: [
      'Una propiedad frente al agua de peso en una de las direcciones consolidadas de {destination}.',
      'El tipo de orilla de {destination} que cambia de manos con discreción, y pocas veces.',
    ],
    trophy: [
      'Entre las pocas propiedades frente al agua verdaderamente irrepetibles de {destination}.',
      'Una adquisición generacional en el tramo de agua más protegido de {destination}.',
    ],
  },
  titleByType: {
    villa: [
      'Villa con {access} en {locality}',
      'Villa frente al agua con {frontage} m de orilla, {locality}',
      'Villa sobre el {waterBody} en {locality}',
    ],
    estate: ['Finca frente al agua con {access}, {locality}', 'Finca con {frontage} m de orilla privada, {locality}'],
    private_island: ['Isla privada frente a {locality}'],
    boathouse: ['Casa-embarcadero en el {waterBody}, {locality}'],
    marina_residence: ['Residencia de marina con amarre de {loa} m, {locality}'],
    penthouse: ['Ático frente al agua en {locality}'],
    apartment: ['Apartamento junto al agua con {access}, {locality}'],
    townhouse: ['Casa de canal en {locality}'],
    chalet: ['Chalet frente al agua en {locality}'],
    farmhouse: ['Casa de campo frente al agua cerca de {locality}'],
    _: ['Propiedad frente al agua con {access} en {locality}'],
  },
  words: {
    beachType: { sand: 'arena', pebble: 'guijarros', rock: 'roca', mixed: 'mixta', none: 'natural' },
    access: {
      private_beach: 'playa privada',
      shared_beach: 'playa compartida',
      direct_shore: 'acceso directo a la orilla',
      private_dock: 'muelle privado',
      private_mooring: 'fondeo privado',
      marina_berth_included: 'amarre incluido en marina',
      boathouse: 'casa-embarcadero',
      slipway: 'rampa de botadura',
      seawall_quay: 'muelle de escollera',
      rock_platform: 'plataforma rocosa',
      riparian_access: 'acceso ribereño',
      whole_island: 'propiedad de la isla completa',
    },
  },
};
