export const theme = {
  colors: {
    primary: {
      DEFAULT: '#1DA1F2', // Twitter Blue
      hover: '#1a91da',
      light: '#E8F5FD',
    },
    secondary: {
      DEFAULT: '#657786', // Twitter Gray
      light: '#AAB8C2',
      dark: '#14171A',
    },
    success: {
      DEFAULT: '#17BF63', // Twitter Green
      hover: '#15a857',
    },
    danger: {
      DEFAULT: '#E0245E', // Twitter Red
      hover: '#c01e4f',
    },
    background: {
      light: '#FFFFFF',
      dark: '#15202B',
      card: {
        light: '#F7F9FA',
        dark: '#192734',
      },
    },
    border: {
      light: '#E1E8ED',
      dark: '#38444D',
    },
    text: {
      primary: {
        light: '#14171A',
        dark: '#F7F9FA',
      },
      secondary: {
        light: '#657786',
        dark: '#AAB8C2',
      },
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
  transitions: {
    default: 'all 0.2s ease-in-out',
    fast: 'all 0.1s ease-in-out',
    slow: 'all 0.3s ease-in-out',
  },
  typography: {
    fontFamily: {
      sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  zIndex: {
    dropdown: '1000',
    sticky: '1020',
    fixed: '1030',
    modal: '1040',
    popover: '1050',
    tooltip: '1060',
  },
};
