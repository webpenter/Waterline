// §13.9 : brouillon machine à relire par un locuteur natif — voir /docs/translation-review.md
import type { LocaleTemplates } from './types';

export const fr: LocaleTemplates = {
  openingByType: {
    villa: [
      'Une villa en bord d’eau où le jardin s’achève sur la rive elle-même.',
      'Cette villa se tient sur la ligne d’eau, la rive à quelques pas.',
      'Une villa lumineuse construite autour de son linéaire d’eau, et non d’une simple vue.',
      'Une villa privée détenant un rare linéaire de rive en pleine propriété.',
    ],
    estate: [
      'Un domaine en bord d’eau d’une réelle ampleur, avec sa propre rive derrière ses grilles.',
      'Un domaine établi dont les terres descendent sans interruption jusqu’à l’eau.',
      'Un domaine où la rive fait partie du titre, pas du décor.',
    ],
    private_island: [
      'Une île privée entière, vendue avec chaque mètre de son rivage.',
      'Une île en propriété unique : l’eau n’est pas la limite mais l’adresse.',
      'Une île autonome accessible uniquement par bateau.',
    ],
    boathouse: [
      'Un hangar à bateaux réaménagé posé là où l’eau commence, avec mise à l’eau directe.',
      'Une vraie maison-hangar : l’eau est sous le bâtiment, pas au-delà du jardin.',
    ],
    _: [
      'Une maison en bord d’eau dont la rive appartient au titre de propriété.',
      'Une propriété entièrement organisée autour de son accès direct à l’eau.',
      'Un accès direct rare sur un marché qui vend surtout des vues.',
    ],
  },
  positioning: [
    'Elle occupe une position calme à {locality}, face à l’eau libre.',
    'Le cadre est {locality} dans sa version la plus paisible, à l’écart du passage.',
    'Elle tient l’une des dernières positions en première ligne de {locality}.',
    'La propriété est posée au ras de l’eau sur un tronçon protégé de {locality}.',
  ],
  waterSentence: [
    'La propriété détient {frontage} mètres de rive privée sur {waterBody}, au rivage de {beachType} accessible depuis le jardin.',
    'Ce sont {frontage} mètres de rivage en pleine propriété sur {waterBody}, {beachType} et entièrement privés.',
    'Son linéaire de {frontage} mètres sur {waterBody} est l’essentiel : rive de {beachType}, accès par la pelouse.',
    '{frontage} mètres de ligne d’eau sur {waterBody} figurent au titre, rive de {beachType} sous la terrasse.',
  ],
  waterSentenceNoFrontage: [
    'L’accès à {waterBody} est direct par {access}, la ligne d’eau touchant la limite.',
    '{waterBody} se rejoint immédiatement par {access} — sans route ni interruption.',
    'L’accès à l’eau se fait par {access}, directement sur {waterBody}.',
  ],
  accommodationSentence: [
    'À l’intérieur, {bedrooms} chambres et {bathrooms} salles de bains sur {builtArea} m².',
    'La maison offre {builtArea} m², soit {bedrooms} chambres et {bathrooms} salles de bains.',
    'La surface habitable atteint {builtArea} m² — {bedrooms} chambres, {bathrooms} salles de bains, pièces de vie tournées vers l’eau.',
    '{bedrooms} chambres et {bathrooms} salles de bains occupent {builtArea} m², presque toutes côté eau.',
  ],
  outdoorSentence: [
    'À l’extérieur, {terrace} m² de terrasses descendent vers la rive dans un terrain de {plotArea} m².',
    'Le terrain de {plotArea} m² est dessiné pour garder l’eau en vue, avec {terrace} m² de terrasses.',
    'Un parc de {plotArea} m² entoure la maison ; la terrasse principale de {terrace} m² fait face à l’eau.',
  ],
  nauticalSentence: [
    'L’amarrage reçoit un bateau jusqu’à {loa} mètres, par {depth} mètres de fond.',
    'Des bateaux jusqu’à {loa} m s’amarrent dans {depth} m d’eau : l’arrivée par la mer est l’entrée prévue.',
    'Amarrage privé pour une unité de {loa} mètres au plus, sur {depth} mètres de fond.',
  ],
  locationSentence: [
    '{marina} se trouve à {marinaKm} km pour le carburant, l’entretien et l’hivernage.',
    'Le port de plaisance le plus proche, {marina}, est à {marinaKm} km par l’eau.',
    'Pour la plaisance du quotidien, {marina} est à {marinaKm} km de la propriété.',
  ],
  closingByTier: {
    standard: [
      'Une entrée concrète dans la vraie propriété de bord d’eau à {destination}.',
      'L’une des offres les plus abordables avec accès direct à l’eau actuellement à {destination}.',
    ],
    premium: [
      'Un bien de bord d’eau sérieux, à l’une des adresses établies de {destination}.',
      'Le genre de rive de {destination} qui change de mains discrètement, et rarement.',
    ],
    trophy: [
      'Parmi les rares biens de bord d’eau réellement irremplaçables de {destination}.',
      'Une acquisition générationnelle sur le tronçon d’eau le plus protégé de {destination}.',
    ],
  },
  titleByType: {
    villa: [
      'Villa avec {access} à {locality}',
      'Villa en bord d’eau, {frontage} m de rive, {locality}',
      'Villa sur {waterBody} à {locality}',
    ],
    estate: ['Domaine en bord d’eau avec {access}, {locality}', 'Domaine avec {frontage} m de rive privée, {locality}'],
    private_island: ['Île privée au large de {locality}'],
    boathouse: ['Hangar à bateaux sur {waterBody}, {locality}'],
    marina_residence: ['Résidence de marina avec anneau de {loa} m, {locality}'],
    penthouse: ['Penthouse en bord d’eau à {locality}'],
    apartment: ['Appartement au bord de l’eau avec {access}, {locality}'],
    townhouse: ['Maison de canal à {locality}'],
    chalet: ['Chalet en bord d’eau à {locality}'],
    farmhouse: ['Mas en bord d’eau près de {locality}'],
    _: ['Propriété en bord d’eau avec {access} à {locality}'],
  },
  words: {
    beachType: { sand: 'sable', pebble: 'galets', rock: 'roche', mixed: 'mixte', none: 'naturel' },
    access: {
      private_beach: 'plage privée',
      shared_beach: 'plage partagée',
      direct_shore: 'accès direct à la rive',
      private_dock: 'ponton privé',
      private_mooring: 'mouillage privé',
      marina_berth_included: 'anneau de marina inclus',
      boathouse: 'hangar à bateaux',
      slipway: 'cale de mise à l’eau',
      seawall_quay: 'quai',
      rock_platform: 'plateforme rocheuse',
      riparian_access: 'accès riverain',
      whole_island: 'île entière en propriété',
    },
  },
};
