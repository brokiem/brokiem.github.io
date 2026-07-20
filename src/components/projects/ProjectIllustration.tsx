import {hashName, projectPaletteStyle} from "./project-palette";

const layoutOrder = [4, 1, 6, 3, 7, 2, 5, 0] as const;

export function ProjectIllustration(props: {name: string; variant?: number}) {
  const seed = () => hashName(props.name) + (props.variant ?? 0) * 97;
  const layout = () => layoutOrder[Math.abs(props.variant ?? hashName(props.name)) % layoutOrder.length] ?? 0;
  const letterLeft = () => ((seed() >>> 3) & 1) === 1;
  const style = () => [
    projectPaletteStyle(props.name, props.variant),
    `--illustration-weight:${480 + seed() % 321}`,
    `--illustration-width:${78 + (seed() >>> 4) % 43}%`,
    `--illustration-slant:-${(seed() >>> 7) % 9}deg`,
    `--illustration-rotation:${(seed() >>> 10) % 9 - 4}deg`,
  ].join(";");

  return (
    <span
      class={`project-illustration project-illustration--${layout()}`}
      classList={{"project-illustration--letter-left": letterLeft()}}
      style={style()}
      aria-hidden="true"
    >
      <i class="illustration-shape illustration-shape-one"/>
      <i class="illustration-shape illustration-shape-two"/>
      <i class="illustration-shape illustration-shape-three"/>
      <strong>{props.name.slice(0, 1).toLowerCase()}</strong>
    </span>
  );
}
