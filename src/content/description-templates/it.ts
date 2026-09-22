// §13.9: machine-drafted per la revisione madrelingua — see /docs/translation-review.md
import type { LocaleTemplates } from './types';

export const it: LocaleTemplates = {
  openingByType: {
    villa: [
      'Una villa fronte acqua dove il giardino termina direttamente sulla riva.',
      'Questa villa sorge sulla linea d’acqua, con la riva raggiungibile in pochi passi.',
      'Una villa luminosa costruita attorno al proprio fronte acqua, non a una semplice vista.',
      'Una villa privata con un raro tratto di riva di proprietà.',
    ],
    estate: [
      'Una tenuta fronte acqua di vera ampiezza, con riva privata e accesso riservato.',
      'Una tenuta storica i cui terreni scendono senza interruzione fino all’acqua.',
      'Una proprietà unica in cui la riva fa parte del titolo, non del panorama.',
    ],
    private_island: [
      'Un’isola privata intera, venduta con ogni metro della propria costa.',
      'Un’isola in proprietà esclusiva: l’acqua non è il confine ma l’indirizzo.',
      'Un’isola autonoma raggiungibile soltanto in barca.',
    ],
    boathouse: [
      'Una darsena ristrutturata dove comincia l’acqua, con varo diretto dal piano inferiore.',
      'Una vera casa-darsena: l’acqua è sotto l’edificio, non oltre il giardino.',
    ],
    _: [
      'Una casa fronte acqua in cui la riva appartiene al titolo di proprietà.',
      'Una proprietà organizzata interamente attorno all’accesso diretto all’acqua.',
      'Un raro affaccio diretto in un mercato che vende soprattutto viste.',
    ],
  },
  positioning: [
    'Sorge in posizione tranquilla a {locality}, rivolta verso l’acqua aperta.',
    'Il contesto è {locality} nella sua versione più quieta, lontano dalle strade di passaggio.',
    'Occupa una delle ultime posizioni in prima fila di {locality}.',
    'La proprietà è adagiata sull’acqua in un tratto protetto di {locality}.',
  ],
  waterSentence: [
    'La proprietà dispone di {frontage} metri di fronte privato sul {waterBody}, con riva di {beachType} raggiungibile direttamente dal giardino.',
    'Sono {frontage} i metri di riva di proprietà sul {waterBody}, {beachType} e completamente privati.',
    'Il fronte di {frontage} metri sul {waterBody} è il dato che conta: riva di {beachType}, accesso dal prato.',
    'Al titolo appartengono {frontage} metri di linea d’acqua sul {waterBody}, con riva di {beachType} sotto la terrazza.',
  ],
  waterSentenceNoFrontage: [
    'L’accesso al {waterBody} è diretto tramite {access}, con la riva praticamente al confine.',
    'Il {waterBody} si raggiunge immediatamente attraverso {access} — senza strade né interruzioni.',
    'L’accesso all’acqua avviene tramite {access} direttamente sul {waterBody}.',
  ],
  accommodationSentence: [
    'All’interno, {bedrooms} camere e {bathrooms} bagni su {builtArea} m² di superficie.',
    'La casa offre {builtArea} m² con {bedrooms} camere e {bathrooms} bagni.',
    'La superficie interna è di {builtArea} m² — {bedrooms} camere, {bathrooms} bagni e zone giorno rivolte all’acqua.',
    '{bedrooms} camere e {bathrooms} bagni occupano {builtArea} m², quasi tutti con affaccio sull’acqua.',
  ],
  outdoorSentence: [
    'All’esterno, {terrace} m² di terrazze digradano verso la riva in un lotto di {plotArea} m².',
    'Il terreno di {plotArea} m² è disegnato per tenere l’acqua in vista, con {terrace} m² di terrazze.',
    'Un giardino di {plotArea} m² avvolge la casa; la terrazza principale di {terrace} m² guarda l’acqua.',
  ],
  nauticalSentence: [
    'L’ormeggio accoglie una barca fino a {loa} metri, con {depth} metri di fondale.',
    'Barche fino a {loa} m ormeggiano in {depth} m d’acqua: l’arrivo dal mare è l’ingresso previsto.',
    'Ormeggio privato per un’imbarcazione fino a {loa} metri su {depth} metri di fondale.',
  ],
  locationSentence: [
    '{marina} dista {marinaKm} km per carburante, assistenza e rimessaggio.',
    'Il porto attrezzato più vicino, {marina}, è a {marinaKm} km via acqua.',
    'Per la nautica di ogni giorno, {marina} è a {marinaKm} km dalla proprietà.',
  ],
  closingByTier: {
    standard: [
      'Un ingresso concreto nella vera proprietà fronte acqua in {destination}.',
      'Una delle proposte più accessibili con accesso diretto all’acqua oggi in {destination}.',
    ],
    premium: [
      'Una proprietà fronte acqua di peso in uno degli indirizzi storici di {destination}.',
      'Il tipo di fronte acqua di {destination} che cambia proprietario in silenzio, e di rado.',
    ],
    trophy: [
      'Tra le poche proprietà fronte acqua davvero irripetibili di {destination}.',
      'Un acquisto generazionale sul tratto d’acqua più protetto di {destination}.',
    ],
  },
  titleByType: {
    villa: [
      'Villa con {access} a {locality}',
      'Villa fronte acqua con {frontage} m di riva, {locality}',
      'Villa sul {waterBody} a {locality}',
    ],
    estate: ['Tenuta fronte acqua con {access}, {locality}', 'Tenuta con {frontage} m di riva privata, {locality}'],
    private_island: ['Isola privata al largo di {locality}'],
    boathouse: ['Darsena sul {waterBody}, {locality}'],
    marina_residence: ['Residenza in marina con posto barca da {loa} m, {locality}'],
    penthouse: ['Attico fronte acqua a {locality}'],
    apartment: ['Appartamento sull’acqua con {access}, {locality}'],
    townhouse: ['Casa sul canale a {locality}'],
    chalet: ['Chalet fronte acqua a {locality}'],
    farmhouse: ['Casale fronte acqua presso {locality}'],
    _: ['Proprietà fronte acqua con {access} a {locality}'],
  },
  words: {
    beachType: { sand: 'sabbia', pebble: 'ciottoli', rock: 'roccia', mixed: 'mista', none: 'naturale' },
    access: {
      private_beach: 'spiaggia privata',
      shared_beach: 'spiaggia condivisa',
      direct_shore: 'accesso diretto alla riva',
      private_dock: 'pontile privato',
      private_mooring: 'ormeggio privato',
      marina_berth_included: 'posto barca incluso in marina',
      boathouse: 'darsena',
      slipway: 'scivolo di alaggio',
      seawall_quay: 'banchina',
      rock_platform: 'piattaforma di roccia',
      riparian_access: 'accesso rivierasco',
      whole_island: 'proprietà dell’intera isola',
    },
  },
};
