/* eslint-disable @typescript-eslint/no-unused-vars */
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

export default {
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
};
