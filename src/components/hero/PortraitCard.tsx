import {createSignal, onCleanup, onMount} from "solid-js";
import {SpringController} from "../../lib/spring-controller";

export function PortraitCard() {
  const [foundGrass, setFoundGrass] = createSignal(false);
  let card: HTMLButtonElement | undefined;
  let bounds: DOMRect | undefined;
  let reducedMotion: MediaQueryList | undefined;
  let spring: SpringController<"tiltX" | "tiltY" | "skewX" | "skewY" | "glowX" | "glowY"> | undefined;

  const move = (event: PointerEvent) => {
    if (event.pointerType === "touch" || reducedMotion?.matches || !bounds) return;
    const x = clamp((event.clientX - bounds.left) / bounds.width - 0.5, -0.5, 0.5);
    const y = clamp((event.clientY - bounds.top) / bounds.height - 0.5, -0.5, 0.5);
    const horizontalEdge = edgeInfluence(x);
    const verticalEdge = edgeInfluence(y);
    spring?.set({
      tiltX: verticalEdge * -7,
      tiltY: horizontalEdge * 9,
      skewX: horizontalEdge * 1.1,
      skewY: verticalEdge * -0.7,
      glowX: (x + 0.5) * 100,
      glowY: (y + 0.5) * 100,
    });
  };

  const reset = () => {
    spring?.set({tiltX: 0, tiltY: 0, skewX: 0, skewY: 0, glowX: 50, glowY: 50});
  };

  const enter = (event: PointerEvent & {currentTarget: HTMLButtonElement}) => {
    if (event.pointerType === "touch" || reducedMotion?.matches) return;
    bounds = event.currentTarget.getBoundingClientRect();
  };

  onMount(() => {
    if (!card) return;
    reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    spring = new SpringController(
      {tiltX: 0, tiltY: 0, skewX: 0, skewY: 0, glowX: 50, glowY: 50},
      {stiffness: 225, damping: 20, mass: 0.66},
      (values) => {
        if (!card) return;
        card.style.setProperty("--tilt-x", `${values.tiltX.toFixed(2)}deg`);
        card.style.setProperty("--tilt-y", `${values.tiltY.toFixed(2)}deg`);
        card.style.setProperty("--skew-x", `${values.skewX.toFixed(2)}deg`);
        card.style.setProperty("--skew-y", `${values.skewY.toFixed(2)}deg`);
        card.style.setProperty("--glow-x", `${values.glowX.toFixed(2)}%`);
        card.style.setProperty("--glow-y", `${values.glowY.toFixed(2)}%`);
      },
    );

    const motionChange = () => {
      if (reducedMotion?.matches) spring?.jump({tiltX: 0, tiltY: 0, skewX: 0, skewY: 0, glowX: 50, glowY: 50});
    };
    reducedMotion.addEventListener("change", motionChange);

    onCleanup(() => {
      reducedMotion?.removeEventListener("change", motionChange);
      spring?.destroy();
    });
  });

  return (
    <button
      ref={card}
      type="button"
      class="portrait-card"
      classList={{"has-found-grass": foundGrass()}}
      onClick={() => setFoundGrass((value) => !value)}
      onPointerEnter={enter}
      onPointerMove={move}
      onPointerLeave={() => { bounds = undefined; reset(); }}
      aria-pressed={foundGrass()}
      aria-label={foundGrass() ? "Hide the hidden grass message" : "A quiet patch of grass. Activate to investigate"}
      data-ripple
    >
      <span class="portrait-image-layer" aria-hidden="true">
        <img src="/brokiem.webp" width="512" height="512" alt="" decoding="async"/>
      </span>
      <span class="portrait-sheen" aria-hidden="true"/>
      <span class="portrait-label"><span aria-hidden="true">↘</span>brokiem</span>
      <span class="grass-note"><strong>Achievement unlocked</strong>Grass touched +1</span>
    </button>
  );
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function edgeInfluence(value: number) {
  const edge = clamp((Math.abs(value) - 0.16) / 0.34, 0, 1);
  const eased = edge * edge * (3 - 2 * edge);
  return Math.sign(value) * eased;
}
