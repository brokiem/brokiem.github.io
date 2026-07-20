import {createSignal, onCleanup, onMount} from "solid-js";
import {SpringController} from "../../lib/spring-controller";

export function PortraitCard() {
  const [foundGrass, setFoundGrass] = createSignal(false);
  let card: HTMLButtonElement | undefined;
  let bounds: DOMRect | undefined;
  let spring: SpringController<"tiltX" | "tiltY" | "glowX" | "glowY"> | undefined;

  const move = (event: PointerEvent) => {
    if (event.pointerType === "touch" || !bounds) return;
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    spring?.set({tiltX: y * -2, tiltY: x * 2.5, glowX: (x + 0.5) * 100, glowY: (y + 0.5) * 100});
  };

  const reset = () => {
    spring?.set({tiltX: 0, tiltY: 0, glowX: 50, glowY: 50});
  };

  onMount(() => {
    if (!card) return;
    spring = new SpringController(
      {tiltX: 0, tiltY: 0, glowX: 50, glowY: 50},
      {stiffness: 190, damping: 22, mass: 0.68},
      (values) => {
        if (!card) return;
        card.style.setProperty("--tilt-x", `${values.tiltX.toFixed(2)}deg`);
        card.style.setProperty("--tilt-y", `${values.tiltY.toFixed(2)}deg`);
        card.style.setProperty("--glow-x", `${values.glowX.toFixed(2)}%`);
        card.style.setProperty("--glow-y", `${values.glowY.toFixed(2)}%`);
      },
    );

    onCleanup(() => {
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
      onPointerEnter={(event) => { bounds = event.currentTarget.getBoundingClientRect(); }}
      onPointerMove={move}
      onPointerLeave={() => { bounds = undefined; reset(); }}
      aria-pressed={foundGrass()}
      aria-label={foundGrass() ? "Hide the hidden grass message" : "A quiet patch of grass. Activate to investigate"}
      data-ripple
    >
      <img src="/brokiem.webp" width="512" height="512" alt="" decoding="async"/>
      <span class="portrait-sheen" aria-hidden="true"/>
      <span class="portrait-label"><span aria-hidden="true">↘</span>brokiem</span>
      <span class="grass-note"><strong>Achievement unlocked</strong>Grass touched +1</span>
    </button>
  );
}
