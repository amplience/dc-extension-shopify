const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    screens: {
      sm: '640px',
      md: '990px',
      'md-max': { max: '767.98px' },
      lg: '1024px',
      xl: '1440px',
      '2xl': '1920px',
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1.5' }],
      sm: ['0.875rem', { lineHeight: '1.5' }],
      base: ['1rem', { lineHeight: '1.5' }],
      lg: ['1.125rem', { lineHeight: '1.5' }],
      xl: [
        'clamp(1.125rem, 1.0809871850727881rem + 0.1877920165857909vw, 1.25rem)',
        { lineHeight: '1.2' },
      ],
      '2xl': [
        'clamp(1.5rem, 1.4559871850727881rem + 0.1877920165857909vw, 1.625rem)',
        { lineHeight: '1.2' },
      ],
      '3xl': [
        'clamp(1.25rem, 1.1619743701455765rem + 0.3755840331715818vw, 1.5rem)',
        { lineHeight: '1.2' },
      ],
      '4xl': [
        'clamp(1.5rem, 1.4119743701455765rem + 0.3755840331715818vw, 1.75rem)',
        { lineHeight: '1.2' },
      ],
      '5xl': [
        'clamp(1.375rem, 1.1989487402911527rem + 0.7511680663431636vw, 1.875rem)',
        { lineHeight: '1.2' },
      ],
      '6xl': [
        'clamp(1.625rem, 1.4049359253639409rem + 0.9389600829289545vw, 2.25rem)',
        { lineHeight: '1.2' },
      ],
      '7xl': [
        'clamp(2.25rem, 1.9419102955095173rem + 1.3145441161005362vw, 3.125rem)',
        { lineHeight: '0.92' },
      ],
      '8xl': [
        'clamp(2.875rem, 2.3468462208734584rem + 2.2535041990294906vw, 4.375rem)',
        { lineHeight: '0.857' },
      ],
      '9xl': [
        'clamp(2.875rem, calc(2.875rem + ((1vw - 0.48rem) * 9.8958)), 10rem)',
        { lineHeight: '0.8125' },
      ],
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: '#000',
      white: '#fff',
      blue: {
        DEFAULT: '#3b60ff',
        hover: '#2943b3',
      },
      aqua: '#44e9ff',
      green: '#28a22b',
      'dark-grey': '#5e676f',
      'dark-blue': '#0c1d37',
      red: '#eb0000',
      gray: {
        DEFAULT: '#999',
        50: '#fafafa',
        100: '#f5f5f5',
        200: '#eee',
        300: '#ddd',
        400: '#ccc',
        500: '#aaa',
        600: '#999',
        700: '#666',
        800: '#333',
        900: '#111',
      },
    },
    aspectRatio: {
      auto: 'auto',
      square: '1 / 1',
      '16x9': '16 / 9',
      '9x16': '9 / 16',
      '4x3': '4 / 3',
      '6x1': '6 / 1',
      '3x1': '3 / 1',
      '3x4': '3 / 4',
      '21x9': '21 / 9',
      '5x4': '5 / 4',
      '9x4': '9 / 4',
      '5x1': '5 / 1',
      '3x1': '3 / 1',
    },
    extend: {
      spacing: {
        13: '3.125rem',
        15: '3.75rem',
        45: '11.25rem',
        '1/2': '50%',
        '1/3': '33.333333%',
        '2/3': '66.666667%',
        '1/4': '25%',
        '1/12': '8.333333%',
        '2/12': '16.666667%',
        '3/12': '25%',
        '4/12': '33.333333%',
        'container-rs':
          'clamp(1rem, -0.8293264227134587rem + 3.8161053522612156vw, 3.75rem)',
      },
      height: ({ theme }) => ({
        25: '6.25rem',
        'screen-nav-creep': 'calc(100vh - 8.75rem)',
        'screen-nav-no-creep': 'calc(100vh - 4.375rem)',
      }),
      maxWidth: ({ theme }) => theme('width'),
      minWidth: ({ theme }) => theme('width'),
      maxHeight: ({ theme }) => ({
        ...theme('height'),
        'screen-nav-creep': 'calc(100vh - 8.75rem)',
        'screen-nav-no-creep': 'calc(100vh - 4.375rem)',
      }),
      minHeight: ({ theme }) => ({
        ...theme('height'),
        'screen-nav-creep': 'calc(100vh - 8.75rem)',
        'screen-nav-no-creep': 'calc(100vh - 4.375rem)',
      }),
      fontFamily: {
        sans: ['"Proxima Nova"', ...defaultTheme.fontFamily.sans],
        display: ['"RBNo2"', ...defaultTheme.fontFamily.sans],
      },
      borderColor: ({ theme }) => ({
        DEFAULT: theme('colors.gray.300', 'currentColor'),
      }),
      borderRadius: {
        DEFAULT: '0.375rem',
      },
    },
  },
  corePlugins: {
    preflight: true,
    container: false,
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/line-clamp'),
  ],
};
