import { StyleSheet } from 'react-native';

export const Colors = {
  // Black & White only
  white: '#FFFFFF',
  black: '#000000',
  // Neutral shades
  surface: '#FFFFFF',
  surfaceAlt: '#F7F7F7',
  ink: '#000000',
  body: '#111111',
  muted: '#555555',
  subtle: '#777777',
  rule: '#E5E5E5',
  // Backgrounds
  bgPrimary: '#FFFFFF',
  bgSecondary: '#FFFFFF',
  // Brand kept monochrome
  brand: '#000000',
  brandLight: '#FFFFFF',
  brandBorder: '#000000',
  // Legacy colors (monochrome substitutes for compatibility)
  tealLight: '#F7F7F7',
  teal: '#555555',
  greenLight: '#F0F0F0',
  green: '#000000',
  redLight: '#F5F5F5',
  red: '#111111',
  amber: '#777777',
};

export const Typography = {
  // Font sizes (sp equivalent)
  xs:   11,
  sm:   13,
  base: 15,
  md:   16,
  lg:   18,
  xl:   22,
  '2xl': 26,
  '3xl': 32,

  // Line heights
  tight:  1.25,
  normal: 1.5,
  relaxed: 1.75,
};

export const Spacing = {
  '0':   0,
  '1':   4,
  '2':   8,
  '3':   12,
  '4':   16,
  '5':   20,
  '6':   24,
  '8':   32,
  '10':  40,
  '12':  48,
  '16':  64,
};

export const Radii = {
  sm:  6,
  md:  10,
  lg:  14,
  xl:  20,
  full: 999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const GlobalStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bgSecondary,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radii.lg,
    padding: Spacing['4'],
    ...Shadows.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
