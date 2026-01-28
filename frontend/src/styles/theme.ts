import { createTheme, Theme } from '@mui/material/styles';

export type ThemeMode = 'light' | 'dark';

const COLORS = {
  primary: {
    light: '#ffede8',
    main: '#fe7f2d',
    dark: '#220a00',
  },
  secondary: {
    light: '#e9f2fa',
    main: '#578cad',
    dark: '#233d4d',
  },
  white: '#ffffff',
  black: '#000000',
  gray: {
    50: '#f5f5f5',
    900: '#121212',
  },
  paper: {
    light: '#ffffff',
    dark: '#1e1e1e',
  },
} as const;

const BORDER_RADIUS = {
  small: 4,
  medium: 8,
  large: 12,
} as const;

const FONT_WEIGHTS = {
  regular: 400,
  medium: 500,
  semiBold: 600,
  bold: 700,
} as const;

const typography = {
  fontFamily: '"DM Sans", "Helvetica", "Arial", sans-serif',
  h1: { fontSize: '2.5rem', fontWeight: FONT_WEIGHTS.semiBold },
  h2: { fontSize: '2rem', fontWeight: FONT_WEIGHTS.semiBold },
  h3: { fontSize: '1.75rem', fontWeight: FONT_WEIGHTS.semiBold },
  h4: { fontSize: '1.5rem', fontWeight: FONT_WEIGHTS.semiBold },
  h5: { fontSize: '1.25rem', fontWeight: FONT_WEIGHTS.semiBold },
  h6: { fontSize: '1rem', fontWeight: FONT_WEIGHTS.semiBold },
  button: { fontWeight: FONT_WEIGHTS.medium },
};

const basePalette = {
  primary: {
    light: COLORS.primary.light,
    main: COLORS.primary.main,
    dark: COLORS.primary.dark,
    contrastText: COLORS.white,
  },
};

const palettes = {
  light: {
    mode: 'light' as const,
    ...basePalette,
    secondary: {
      light: COLORS.secondary.light,
      main: COLORS.secondary.main,
      dark: COLORS.secondary.dark,
      contrastText: COLORS.white,
    },
    background: {
      default: COLORS.gray[50],
      paper: COLORS.paper.light,
    },
  },
  dark: {
    mode: 'dark' as const,
    ...basePalette,
    secondary: {
      light: '#3d5a6a',
      main: COLORS.secondary.main,
      dark: '#1a2c36',
      contrastText: COLORS.white,
    },
    background: {
      default: COLORS.gray[900],
      paper: COLORS.paper.dark,
    },
    text: {
      primary: COLORS.white,
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
};

const baseComponents = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: BORDER_RADIUS.medium,
        textTransform: 'none' as const,
      },
      contained: {
        boxShadow: 'none',
        '&:hover': { boxShadow: 'none' },
      },
      text: {
        '&:hover': { backgroundColor: `${COLORS.primary.main}14` },
      },
      outlined: {
        borderWidth: 1.5,
        '&:hover': { borderWidth: 1.5 },
      },
    },
  },
  MuiTextField: {
    defaultProps: {
      variant: 'outlined' as const,
    },
  },
  MuiInputAdornment: {
    styleOverrides: {
      positionStart: { marginRight: 12 },
    },
  },
  MuiInputLabel: {
    styleOverrides: {
      root: {
        '&.MuiInputLabel-shrink': {
          transform: 'translate(14px, -9px) scale(0.75)',
        },
      },
    },
  },
  MuiLink: {
    styleOverrides: {
      root: {
        fontWeight: FONT_WEIGHTS.semiBold,
        textDecoration: 'none',
        '&:hover': { textDecoration: 'underline' },
      },
    },
  },
};

const getAutofillStyles = (mode: ThemeMode) => {
  const bgColor = mode === 'light' ? COLORS.paper.light : COLORS.paper.dark;
  const textColor = mode === 'light' ? 'inherit' : COLORS.white;

  return {
    '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active':
      {
        WebkitBoxShadow: `0 0 0 100px ${bgColor} inset !important`,
        WebkitTextFillColor: `${textColor} !important`,
        caretColor: `${textColor} !important`,
      },
  };
};

export function getTheme(mode: ThemeMode): Theme {
  return createTheme({
    palette: palettes[mode],
    typography,
    components: {
      ...baseComponents,
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: BORDER_RADIUS.medium,
            '& input': { padding: '14px 14px' },
            ...getAutofillStyles(mode),
          },
          adornedStart: {
            '& input': { paddingLeft: 0 },
          },
        },
      },
    },
  });
}

export const theme = getTheme('light');
