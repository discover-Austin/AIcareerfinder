/**
 * PDF Export Configuration Constants
 *
 * Centralized configuration for PDF generation including layout, colors, and styling.
 */

/**
 * PDF layout dimensions and spacing
 */
export const PDF_LAYOUT = {
  /** Page margin in millimeters */
  MARGIN: 20,

  /** Default line height in millimeters */
  LINE_HEIGHT: 7,

  /** Header section height in millimeters */
  HEADER_HEIGHT: 50,

  /** Minimum space needed before adding new page */
  MIN_SPACE_BEFORE_PAGE: 15,

  /** Space for section headers */
  SECTION_HEADER_SPACE: 20,

  /** Space for list items */
  LIST_ITEM_SPACE: 15,
} as const;

/**
 * PDF color palette (RGB values)
 */
export const PDF_COLORS = {
  /** Primary brand color - Indigo */
  PRIMARY: { r: 79, g: 70, b: 229 },

  /** Success/positive color - Green */
  SUCCESS: { r: 34, g: 139, b: 34 },

  /** Warning/growth color - Orange */
  WARNING: { r: 255, g: 140, b: 0 },

  /** White color */
  WHITE: { r: 255, g: 255, b: 255 },

  /** Black color */
  BLACK: { r: 0, g: 0, b: 0 },

  /** Gray color for secondary text */
  GRAY: { r: 128, g: 128, b: 128 },

  /** Light background colors */
  BACKGROUND_LIGHT: { r: 240, g: 240, b: 255 },
  BACKGROUND_VERY_LIGHT: { r: 245, g: 245, b: 250 },
} as const;

/**
 * PDF font sizes
 */
export const PDF_FONT_SIZES = {
  /** Main title */
  TITLE: 24,

  /** Section title */
  SECTION_TITLE: 18,

  /** Subsection header */
  SUBSECTION: 16,

  /** Regular header */
  HEADER: 14,

  /** Subheader */
  SUBHEADER: 11,

  /** Body text */
  BODY: 10,

  /** Small text */
  SMALL: 9,

  /** Footer text */
  FOOTER: 8,
} as const;

/**
 * PDF font styles
 */
export const PDF_FONTS = {
  /** Default font family */
  FAMILY: 'helvetica' as const,

  /** Font weights */
  WEIGHT: {
    NORMAL: 'normal' as const,
    BOLD: 'bold' as const,
  },
} as const;
