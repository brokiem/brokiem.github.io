type ProjectIllustrationProps = {
  name: string;
  variant?: number;
};

const layoutOrder = [4, 1, 6, 3, 7, 2, 5, 0] as const;

const projectPalettes = [
  {primary: "#a8c7fa", secondary: "#7fcfff", tertiary: "#c4b5fd", ink: "#d6e7ff"},
  {primary: "#a8dab5", secondary: "#b9d18a", tertiary: "#7dd8cb", ink: "#d0f2d7"},
  {primary: "#e7c66b", secondary: "#f0b990", tertiary: "#c9cf8b", ink: "#fff1bd"},
  {primary: "#ffb4a2", secondary: "#eeb8a8", tertiary: "#ffc1c8", ink: "#ffe1da"},
  {primary: "#d0bcff", secondary: "#c8b7db", tertiary: "#f0b6d7", ink: "#eadfff"},
  {primary: "#83d3dc", secondary: "#a7c8e8", tertiary: "#85d5ba", ink: "#c4f3f6"},
  {primary: "#f4b4c6", secondary: "#d5b9dc", tertiary: "#ffb59a", ink: "#ffe0e8"},
  {primary: "#bedb81", secondary: "#abcba8", tertiary: "#d9c785", ink: "#e5f4c0"},
  {primary: "#b9c4ff", secondary: "#c4b7e8", tertiary: "#96d5f0", ink: "#e0e5ff"},
  {primary: "#82d5c8", secondary: "#a8cec8", tertiary: "#b8c86f", ink: "#c5f5ec"},
  {primary: "#ffb870", secondary: "#d9c39a", tertiary: "#d5b8f0", ink: "#ffe2c2"},
  {primary: "#ffb4ab", secondary: "#e6b6b0", tertiary: "#ddc0a0", ink: "#ffdad6"},
] as const;

export function getProjectPalette(name: string, variant = 0) {
  const paletteIndex = (hashName(name) + Math.max(variant, 0) * 3) % projectPalettes.length;
  return projectPalettes[paletteIndex];
}

export function getProjectPaletteStyle(name: string, variant = 0) {
  const palette = getProjectPalette(name, variant);
  return `--project-primary: ${palette.primary}; --project-secondary: ${palette.secondary}; --project-tertiary: ${palette.tertiary}; --project-ink: ${palette.ink};`;
}

export default function ProjectIllustration(props: ProjectIllustrationProps) {
  const seed = () => hashName(props.name) + (props.variant ?? 0) * 97;
  const variant = () => layoutOrder[Math.abs(props.variant ?? hashName(props.name)) % layoutOrder.length];
  const letterOnLeft = () => ((seed() >>> 3) & 1) === 1;
  const letterWeight = () => 480 + (seed() % 321);
  const letterWidth = () => 78 + ((seed() >>> 4) % 43);
  const letterSlant = () => -((seed() >>> 7) % 9);
  const letterRotation = () => ((seed() >>> 10) % 9) - 4;
  const paletteStyle = () => getProjectPaletteStyle(props.name, props.variant);

  return (
    <span
      class={`project-illustration project-illustration--${variant()}`}
      classList={{"project-illustration--letter-left": letterOnLeft()}}
      style={`${paletteStyle()} --illustration-weight: ${letterWeight()}; --illustration-width: ${letterWidth()}%; --illustration-slant: ${letterSlant()}deg; --illustration-rotation: ${letterRotation()}deg;`}
      aria-hidden="true"
    >
      <i class="illustration-shape illustration-shape-one"/>
      <i class="illustration-shape illustration-shape-two"/>
      <i class="illustration-shape illustration-shape-three"/>
      <strong>{props.name.slice(0, 1).toLowerCase()}</strong>
    </span>
  );
}

function hashName(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}
