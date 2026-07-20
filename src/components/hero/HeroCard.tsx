import {createSignal, onCleanup, onMount} from "solid-js";
import {SpringController} from "../../lib/spring-controller";
import {ActionLink} from "../ui/ActionLink";

const DEFAULT_AXES = {width: 100, weight: 690, slant: 0};
const SHIFTED_AXES = {width: 88, weight: 560, slant: -2};

export function HeroCard() {
  const [shifted, setShifted] = createSignal(false);
  let title: HTMLHeadingElement | undefined;
  let bounds: DOMRect | undefined;
  let allowPointerToggle = true;
  let capturedPointer: number | undefined;
  let spring: SpringController<"width" | "weight" | "slant"> | undefined;

  const baseAxes = () => shifted() ? SHIFTED_AXES : DEFAULT_AXES;
  const setAxes = (horizontal = 0, vertical = 0) => {
    const base = baseAxes();
    spring?.set({
      width: base.width + horizontal * (shifted() ? 4 : 5),
      weight: base.weight - vertical * (shifted() ? 90 : 70),
      slant: base.slant + horizontal * (shifted() ? 6 : 4),
    });
  };

  const pointerMove = (event: PointerEvent) => {
    if (event.pointerType === "touch" || !bounds) return;
    const horizontalPosition = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    const verticalPosition = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
    const isCaptured = capturedPointer === event.pointerId;
    const horizontal = isCaptured ? horizontalPosition : clamp(horizontalPosition, -1, 1);
    const vertical = isCaptured ? verticalPosition : clamp(verticalPosition, -1, 1);
    setAxes(Math.abs(horizontal) < 0.06 ? 0 : horizontal, vertical);
  };

  const pointerDown = (event: PointerEvent & {currentTarget: HTMLDivElement}) => {
    if (event.button !== 0) return;
    allowPointerToggle = true;
    if (event.pointerType === "touch") return;
    capturedPointer = event.pointerId;
    bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const pointerRelease = (event: PointerEvent & {currentTarget: HTMLDivElement}) => {
    if (capturedPointer !== event.pointerId) return;
    const releasedInside = contains(bounds, event.clientX, event.clientY);
    allowPointerToggle = releasedInside;
    capturedPointer = undefined;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (!releasedInside) {
      bounds = undefined;
      reset();
    }
  };

  const pointerCancel = (event: PointerEvent & {currentTarget: HTMLDivElement}) => {
    if (capturedPointer !== event.pointerId) return;
    allowPointerToggle = false;
    capturedPointer = undefined;
    bounds = undefined;
    reset();
  };

  const reset = () => setAxes();
  const toggle = () => {
    setShifted((value) => !value);
    queueMicrotask(reset);
  };
  const click = (event: MouseEvent) => {
    if (event.detail !== 0 && !allowPointerToggle) {
      allowPointerToggle = true;
      return;
    }
    allowPointerToggle = true;
    toggle();
  };

  onMount(() => {
    if (!title) return;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    spring = new SpringController(DEFAULT_AXES, {stiffness: 250, damping: 25, mass: 0.58}, (values) => {
      if (!title) return;
      title.style.fontVariationSettings = `"wdth" ${values.width.toFixed(2)}, "wght" ${values.weight.toFixed(1)}`;
      title.style.setProperty("--hero-skew", `${values.slant.toFixed(2)}deg`);
    });

    const motionChange = () => {
      if (!reducedMotion.matches) return;
      const base = baseAxes();
      spring?.jump(base);
    };
    reducedMotion.addEventListener("change", motionChange);

    onCleanup(() => {
      reducedMotion.removeEventListener("change", motionChange);
      spring?.destroy();
    });
  });

  return (
    <section class="expressive-card hero-card" classList={{"is-flex-shifted": shifted()}}>
      <span class="hero-kicker home-hero-kicker">Independent developer</span>
      <div
        class="hero-title-interaction"
        onPointerMove={pointerMove}
        onPointerEnter={(event) => { bounds = event.currentTarget.getBoundingClientRect(); }}
        onPointerDown={pointerDown}
        onPointerUp={pointerRelease}
        onPointerCancel={pointerCancel}
        onPointerLeave={() => {
          if (capturedPointer !== undefined) return;
          bounds = undefined;
          reset();
        }}
        onClick={click}
      >
        <h1 ref={title} class="hero-title">I make <span>curious</span> little things.</h1>
      </div>

      <span class="hero-detail" aria-hidden="true"><i/><i/><i/></span>
      <div class="hero-bottom">
        <p>Small digital things made to solve a problem, test an idea, or simply be fun.</p>
        <div class="hero-actions">
          <ActionLink href="/projects">Explore projects</ActionLink>
          <ActionLink href="https://github.com/brokiem" variant="secondary">Visit GitHub</ActionLink>
        </div>
      </div>

      <svg class="hero-doodle" viewBox="0 0 180 96" aria-hidden="true">
        <path d="M9 67c31-47 46 14 78-30 21-29 36 34 83-24"/>
        <path d="m151 12 20 1-4 19"/>
      </svg>
    </section>
  );
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function contains(bounds: DOMRect | undefined, x: number, y: number) {
  return Boolean(bounds && x >= bounds.left && x <= bounds.right && y >= bounds.top && y <= bounds.bottom);
}
