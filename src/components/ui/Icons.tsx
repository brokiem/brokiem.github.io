import type {JSX} from "solid-js";

type IconProps = JSX.SvgSVGAttributes<SVGSVGElement>;

export function GitHubIcon(props: IconProps) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...props}><path fill="currentColor" d="M12 2a10 10 0 0 0-3.16 19.49c.5.1.68-.22.68-.48v-1.87c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.6 9.6 0 0 1 12 6.82a9.5 9.5 0 0 1 2.5.34c1.91-1.29 2.75-1.02 2.75-1.02.54 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85V21c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/></svg>;
}

export function FormatPaintIcon() {
  return <span class="material-symbols-outlined" aria-hidden="true">format_paint</span>;
}

export function ChevronIcon(props: IconProps) {
  return <svg viewBox="0 0 20 20" aria-hidden="true" {...props}><path fill="currentColor" d="m7.2 4.4 5.6 5.6-5.6 5.6 1.4 1.4 7-7-7-7-1.4 1.4Z"/></svg>;
}

export function ShareIcon(props: IconProps) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...props}><path fill="currentColor" d="M18 22q-1.25 0-2.13-.88A2.9 2.9 0 0 1 15 19q0-.18.03-.36.02-.19.07-.34l-7.05-4.1q-.43.38-.95.59A2.8 2.8 0 0 1 6 15q-1.25 0-2.13-.88A2.9 2.9 0 0 1 3 12q0-1.25.87-2.13A2.9 2.9 0 0 1 6 9q.58 0 1.1.21.52.22.95.59l7.05-4.1a2.8 2.8 0 0 1-.1-.7q0-1.25.87-2.13A2.9 2.9 0 0 1 18 2q1.25 0 2.13.87A2.9 2.9 0 0 1 21 5q0 1.25-.87 2.13A2.9 2.9 0 0 1 18 8q-.58 0-1.1-.21a3.3 3.3 0 0 1-.95-.59L8.9 11.3q.05.15.08.34Q9 11.82 9 12t-.02.36q-.03.19-.08.34l7.05 4.1q.43-.38.95-.59A2.8 2.8 0 0 1 18 16q1.25 0 2.13.87A2.9 2.9 0 0 1 21 19q0 1.25-.87 2.12A2.9 2.9 0 0 1 18 22Z"/></svg>;
}

export function CheckIcon(props: IconProps) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...props}><path fill="currentColor" d="m9.2 17.2-4.4-4.4 1.4-1.4 3 3 8.6-8.6 1.4 1.4-10 10Z"/></svg>;
}

export function CodeIcon(props: IconProps) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...props}><path fill="currentColor" d="m8.7 16.6-4.6-4.6 4.6-4.6 1.4 1.4L6.9 12l3.2 3.2-1.4 1.4Zm6.6 0-1.4-1.4 3.2-3.2-3.2-3.2 1.4-1.4 4.6 4.6-4.6 4.6Z"/></svg>;
}

export function GamepadIcon(props: IconProps) {
  return <svg viewBox="0 0 20 20" aria-hidden="true" {...props}><path fill="currentColor" d="M7.1 6.1 5.8 3.8H3.2l1.7 3A5.2 5.2 0 0 0 2 11.5V15a2 2 0 0 0 2 2h1.2l1-1.8h7.6l1 1.8H16a2 2 0 0 0 2-2v-3.5a5.2 5.2 0 0 0-2.9-4.7l1.7-3h-2.6l-1.3 2.3A6.8 6.8 0 0 0 10 5.5c-1 0-2 .2-2.9.6ZM6 13.2a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Zm8 0a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Z"/></svg>;
}

export function SpotifyIcon(props: IconProps & {inline?: boolean}) {
  const {inline = true, ...svgProps} = props;
  return (
    <svg viewBox="0 0 496 512" class="spotify-icon" classList={{"is-inline": inline}} aria-hidden="true" {...svgProps}>
      <path fill="currentColor" d="M248 8a248 248 0 1 0 0 496 248 248 0 0 0 0-496Zm101 365c-5 0-7-1-11-4-62-37-135-39-207-24l-12 2c-9 0-15-7-15-15 0-11 6-16 13-17 82-18 166-17 237 26 6 4 10 7 10 16s-7 16-15 16Zm27-66c-6 0-9-2-13-4-62-37-155-52-238-29l-12 2c-11 0-20-8-20-19s6-18 16-21c28-8 56-13 98-13 65 0 127 16 177 45 8 5 11 11 11 20 0 11-9 19-19 19Zm31-76c-6 0-9-1-13-4-72-42-199-53-281-30-4 1-8 3-13 3-13 0-23-10-23-24 0-13 8-21 17-23 35-11 75-16 118-16 73 0 149 16 205 48 8 5 13 11 13 23 0 13-11 23-23 23Z"/>
    </svg>
  );
}
