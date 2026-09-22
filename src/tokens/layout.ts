/**
 * Layout measurements lifted from the design preview (README: "you can lift
 * proportions and structure from these previews directly"). Named here so no
 * component carries a raw pixel value (CLAUDE.md rule 3).
 */
export const layout = {
  /** Minimum height of the search list/map split (.split in the preview). */
  searchSplitMinH: '430px',
  /** Image column width of a search-result row (.row in the preview). */
  searchRowImageW: '150px',
  /** Listing gallery grid height (.gal in the preview). */
  galleryH: '300px',
  /** Desktop hero minimum height (.hero in the preview). */
  heroMinH: '390px',
} as const;
