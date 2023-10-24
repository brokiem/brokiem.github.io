import {defineConfig} from '@unocss/vite';
import presetWind from "@unocss/preset-wind";
import presetAttributify from '@unocss/preset-attributify';

export default defineConfig({
  presets: [
    presetWind(),
    presetAttributify()
  ],
});
