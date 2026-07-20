const palettes = [
  {primary: "#7baaf7", secondary: "#5b92e8", tertiary: "#9cc8ff", ink: "#dceaff"},
  {primary: "#69d38d", secondary: "#4dbd7a", tertiary: "#9be3a7", ink: "#d9f6df"},
  {primary: "#ffd15a", secondary: "#f3b94f", tertiary: "#e7dd63", ink: "#fff1b8"},
  {primary: "#ff8a72", secondary: "#ef6f6c", tertiary: "#ffb07a", ink: "#ffe0d8"},
  {primary: "#b58cf4", secondary: "#926fe0", tertiary: "#d3a0f2", ink: "#eadcff"},
  {primary: "#52cedd", secondary: "#48afcf", tertiary: "#85dfe8", ink: "#d3f6f8"},
  {primary: "#f57fae", secondary: "#db6b9c", tertiary: "#ffabc6", ink: "#ffe0eb"},
  {primary: "#a7d958", secondary: "#82c75b", tertiary: "#cde878", ink: "#ecf8ce"},
  {primary: "#879ff1", secondary: "#6f83da", tertiary: "#a9b9ff", ink: "#e0e6ff"},
  {primary: "#48cbb0", secondary: "#37aa98", tertiary: "#79deca", ink: "#d2f7ee"},
  {primary: "#ff9b50", secondary: "#e98345", tertiary: "#ffc06d", ink: "#ffe5cb"},
  {primary: "#f8756e", secondary: "#d95f61", tertiary: "#ff9c91", ink: "#ffe0dc"},
] as const;

export function projectPaletteStyle(name: string, variant?: number) {
  const index = variant === undefined ? hashName(name) % palettes.length : Math.abs(variant) % palettes.length;
  const palette = palettes[index] ?? palettes[0];
  return `--project-primary:${palette.primary};--project-secondary:${palette.secondary};--project-tertiary:${palette.tertiary};--project-ink:${palette.ink};`;
}

export function hashName(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
