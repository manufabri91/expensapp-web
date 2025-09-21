import { heroui } from '@heroui/theme';

function swapColorValues<T extends object>(colors: T) {
  const swappedColors = {};
  const keys = Object.keys(colors);
  const length = keys.length;

  for (let i = 0; i < length / 2; i++) {
    const key1 = keys[i];
    const key2 = keys[length - 1 - i];

    // @ts-expect-error temp fix
    swappedColors[key1] = colors[key2];
    // @ts-expect-error temp fix
    swappedColors[key2] = colors[key1];
  }
  if (length % 2 !== 0) {
    const middleKey = keys[Math.floor(length / 2)];

    // @ts-expect-error temp fix
    swappedColors[middleKey] = colors[middleKey];
  }

  return swappedColors;
}

const base = {
  50: '#e7ecff',
  100: '#bdc5f7',
  200: '#929eec',
  300: '#6778e4',
  400: '#3d51dc',
  500: '#2438c2',
  600: '#1c2b98',
  700: '#131f6d',
  800: '#091343',
  900: '#02051b',
};

const green = {
  50: '#dff7f4',
  100: '#b0eae1',
  200: '#78ddce',
  300: '#2acfb9',
  400: '#00c3a8',
  500: '#00b598',
  600: '#00a78a',
  700: '#009679',
  800: '#00856a',
  900: '#00674c',
};

const purple = {
  '50': '#f5f7fa',
  '100': '#e9ecf5',
  '200': '#d0d6eb',
  '300': '#acb7d3',
  '400': '#7c8cb0',
  '500': '#536998', // base
  '600': '#43537a',
  '700': '#34405e',
  '800': '#242c41',
  '900': '#161b28',
};

const blue = {
  50: '#e7ebfd',
  100: '#bac4f4',
  200: '#8d9dee',
  300: '#6177e9',
  400: '#384fe4',
  500: '#2537cc',
  600: '#1c2a9e',
  700: '#141e70',
  800: '#0b1243',
  900: '#020618',
};

const blueZinc = {
  '50': '#f5f7fa',
  '100': '#e6eaf5',
  '200': '#c8cdea',
  '300': '#a5addd',
  '400': '#7a83c7',
  '500': '#5259a7',
  '600': '#393e85',
  '700': '#2a2f63',
  '800': '#151a42',
  '900': '#050930',
};

const config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-green': green,
        'brand-purple': purple,
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        brand: ['var(--font-brand)'],
      },
    },
  },
  darkMode: 'class',
  plugins: [
    heroui({
      themes: {
        light: {
          extend: 'light',
          colors: {
            foreground: { ...blueZinc, DEFAULT: blueZinc[900], foreground: blueZinc[50] },
            default: { ...purple, DEFAULT: green[400], foreground: base[900] },
            primary: {
              ...green,
              DEFAULT: green[500],
              foreground: green[50],
            },
            secondary: {
              ...purple,
              DEFAULT: purple[500],
              foreground: purple[50],
            },
            content1: { ...blueZinc, DEFAULT: blueZinc[50], foreground: blueZinc[900] },
            focus: green[700],
          },
        },
        dark: {
          extend: 'dark',
          colors: {
            background: blue[900],
            foreground: { ...swapColorValues(blueZinc), DEFAULT: blueZinc[50], foreground: blueZinc[900] },
            default: { ...swapColorValues(blue), DEFAULT: green[600], foreground: '#fafafa' },
            primary: {
              ...swapColorValues(green),
              DEFAULT: green[600],
              foreground: '#fafafa',
            },
            secondary: {
              ...swapColorValues(purple),
              DEFAULT: purple[500],
              foreground: '#fafafa',
            },
            focus: green[500],
            content1: { ...blueZinc, DEFAULT: blueZinc[900], foreground: blueZinc[200] },
            content2: { ...blue, DEFAULT: blue[900], foreground: blue[200] },
            content3: { ...blueZinc, DEFAULT: blueZinc[900], foreground: blueZinc[200] },
            content4: { ...blueZinc, DEFAULT: blueZinc[900], foreground: blueZinc[200] },
          },
        },
      },
    }),
  ],
};

module.exports = config;
