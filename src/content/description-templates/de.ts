// §13.9: maschinell vorentworfen — muttersprachliche Prüfung siehe /docs/translation-review.md
import type { LocaleTemplates } from './types';

export const de: LocaleTemplates = {
  openingByType: {
    villa: [
      'Eine ruhige Villa am Wasser, deren Garten unmittelbar am Ufer endet.',
      'Diese Villa steht direkt an der Wasserlinie; das Ufer ist in wenigen Schritten erreicht.',
      'Eine lichtdurchflutete Villa, gebaut um ihren eigenen Wasserzugang, nicht um eine Aussicht.',
      'Eine private Villa mit einem seltenen Stück eigener Uferlinie.',
    ],
    estate: [
      'Ein Anwesen am Wasser von echtem Zuschnitt, mit eigener Uferlinie hinter dem Tor.',
      'Ein gewachsenes Anwesen, dessen Grund ohne Unterbrechung bis ans Wasser reicht.',
      'Ein Anwesen, bei dem das Ufer zum Grundbuch gehört, nicht zur Kulisse.',
    ],
    private_island: [
      'Eine ganze Privatinsel, verkauft mit jedem Meter ihrer eigenen Küste.',
      'Eine Insel in einer Hand: Das Wasser ist nicht die Grenze, sondern die Adresse.',
      'Ein autarkes Inselanwesen, nur per Boot erreichbar.',
    ],
    boathouse: [
      'Ein umgebautes Bootshaus dort, wo das Wasser beginnt — mit direktem Zugang von der unteren Ebene.',
      'Ein echtes Bootshaus: Das Wasser liegt unter dem Gebäude, nicht hinter dem Garten.',
    ],
    _: [
      'Ein Haus am Wasser, dessen Uferlinie zum Eigentum gehört.',
      'Eine Immobilie, die vollständig um ihren direkten Wasserzugang organisiert ist.',
      'Ein seltener Direktzugang in einem Markt, der überwiegend Aussichten verkauft.',
    ],
  },
  positioning: [
    'Sie liegt ruhig in {locality}, mit Blick auf offenes Wasser.',
    'Die Umgebung ist {locality} von seiner stillsten Seite, abseits der Durchgangswege.',
    'Sie hält eine der letzten Positionen in erster Reihe von {locality}.',
    'Das Anwesen liegt wassernah an einem geschützten Abschnitt von {locality}.',
  ],
  waterSentence: [
    'Zum Anwesen gehören {frontage} Meter private Uferlinie am {waterBody}, mit {beachType}-Ufer direkt vom Garten aus erreichbar.',
    'Es sind {frontage} Meter eigenes Ufer am {waterBody} — {beachType}, vollständig privat.',
    'Die {frontage} Meter Uferfront am {waterBody} sind die Kernzahl: {beachType}-Ufer, Zugang über den Rasen.',
    '{frontage} Meter Wasserlinie am {waterBody} stehen im Grundbuch, mit {beachType}-Ufer unterhalb der Terrasse.',
  ],
  waterSentenceNoFrontage: [
    'Der Zugang zum {waterBody} erfolgt direkt über {access}; die Wasserlinie liegt praktisch an der Grenze.',
    'Der {waterBody} ist unmittelbar über {access} erreichbar — ohne Straße, ohne Umweg.',
    'Der Wasserzugang führt über {access} direkt an den {waterBody}.',
  ],
  accommodationSentence: [
    'Innen: {bedrooms} Schlafzimmer und {bathrooms} Bäder auf {builtArea} m² Wohnfläche.',
    'Das Haus bietet {builtArea} m², aufgeteilt in {bedrooms} Schlafzimmer und {bathrooms} Bäder.',
    'Die Wohnfläche beträgt {builtArea} m² — {bedrooms} Schlafzimmer, {bathrooms} Bäder, Wohnräume zum Wasser orientiert.',
    '{bedrooms} Schlafzimmer und {bathrooms} Bäder verteilen sich auf {builtArea} m², fast alle zum Wasser gelegen.',
  ],
  outdoorSentence: [
    'Draußen führen {terrace} m² Terrassen zum Ufer hinab, eingebettet in {plotArea} m² Grund.',
    'Das Grundstück von {plotArea} m² ist so angelegt, dass das Wasser stets im Blick bleibt — mit {terrace} m² Terrassen.',
    'Ein Garten von {plotArea} m² umgibt das Haus; die Hauptterrasse mit {terrace} m² liegt zum Wasser.',
  ],
  nauticalSentence: [
    'Der Liegeplatz nimmt ein Boot bis {loa} Meter auf, bei {depth} Metern Wassertiefe.',
    'Boote bis {loa} m liegen längsseits in {depth} m Wasser — die Ankunft über das Wasser ist der eigentliche Eingang.',
    'Privater Liegeplatz für ein Boot bis {loa} Meter bei {depth} Metern Tiefe.',
  ],
  locationSentence: [
    '{marina} liegt {marinaKm} km entfernt — für Kraftstoff, Service und Winterlager.',
    'Der nächste Vollservice-Hafen, {marina}, ist {marinaKm} km über das Wasser entfernt.',
    'Für den Bootsalltag liegt {marina} {marinaKm} km vom Anwesen.',
  ],
  closingByTier: {
    standard: [
      'Ein solider Einstieg in echtes Wasserlagen-Eigentum in {destination}.',
      'Eines der zugänglicheren Angebote mit direktem Wasserzugang derzeit in {destination}.',
    ],
    premium: [
      'Eine gewichtige Wasserlage an einer der etablierten Adressen von {destination}.',
      'Die Art von Ufer in {destination}, die still und selten den Besitzer wechselt.',
    ],
    trophy: [
      'Eine der wenigen wirklich unersetzlichen Wasserlagen in {destination}.',
      'Ein Generationenkauf am geschütztesten Wasserabschnitt von {destination}.',
    ],
  },
  titleByType: {
    villa: [
      'Villa mit {access} in {locality}',
      'Villa am Wasser mit {frontage} m Uferlinie, {locality}',
      'Villa am {waterBody} in {locality}',
    ],
    estate: ['Anwesen am Wasser mit {access}, {locality}', 'Anwesen mit {frontage} m privatem Ufer, {locality}'],
    private_island: ['Privatinsel vor {locality}'],
    boathouse: ['Bootshaus am {waterBody}, {locality}'],
    marina_residence: ['Marina-Residenz mit {loa}-m-Liegeplatz, {locality}'],
    penthouse: ['Penthouse am Wasser in {locality}'],
    apartment: ['Wohnung am Wasser mit {access}, {locality}'],
    townhouse: ['Grachtenhaus in {locality}'],
    chalet: ['Chalet am Wasser in {locality}'],
    farmhouse: ['Landhaus am Wasser bei {locality}'],
    _: ['Wasserlage mit {access} in {locality}'],
  },
  words: {
    beachType: { sand: 'Sand', pebble: 'Kies', rock: 'Fels', mixed: 'gemischt', none: 'naturbelassen' },
    access: {
      private_beach: 'einen Privatstrand',
      shared_beach: 'einen Gemeinschaftsstrand',
      direct_shore: 'direkten Uferzugang',
      private_dock: 'einen privaten Steg',
      private_mooring: 'eine private Mooring',
      marina_berth_included: 'einen inkludierten Marina-Liegeplatz',
      boathouse: 'ein Bootshaus',
      slipway: 'eine Slipanlage',
      seawall_quay: 'eine Kaimauer',
      rock_platform: 'eine Felsplattform',
      riparian_access: 'Ufernutzungsrecht',
      whole_island: 'Eigentum an der ganzen Insel',
    },
  },
};
