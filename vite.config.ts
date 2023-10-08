import {defineConfig} from 'vite';
import solid from 'vite-plugin-solid';
import UnoCSS from '@unocss/vite';

export default defineConfig({
  base: '/website/',
  plugins: [
    solid(),
    UnoCSS(),
  ],
  build: {
    target: 'esnext',
  },
});
