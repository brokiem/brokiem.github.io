const MIN_HOLD_MS = 140;
const RIPPLE_SELECTOR = "[data-ripple]";

type ActiveRipple = {
  element: HTMLSpanElement;
  startedAt: number;
};

export function installMaterialRipples() {
  const activePointers = new Map<number, ActiveRipple>();

  const findSurface = (target: EventTarget | null) => {
    if (!(target instanceof Element)) return null;
    const surface = target.closest<HTMLElement>(RIPPLE_SELECTOR);
    if (!surface || surface.matches(":disabled, [aria-disabled='true']")) return null;
    return surface;
  };

  const createRipple = (surface: HTMLElement, clientX?: number, clientY?: number) => {
    const bounds = surface.getBoundingClientRect();
    const x = clientX === undefined ? bounds.width / 2 : clientX - bounds.left;
    const y = clientY === undefined ? bounds.height / 2 : clientY - bounds.top;
    const radius = Math.hypot(Math.max(x, bounds.width - x), Math.max(y, bounds.height - y));
    const element = document.createElement("span");
    element.className = "material-ripple";
    element.style.width = `${radius * 2}px`;
    element.style.height = `${radius * 2}px`;
    element.style.left = `${x - radius}px`;
    element.style.top = `${y - radius}px`;
    surface.classList.add("material-ripple-surface");
    surface.append(element);

    return {element, startedAt: performance.now()};
  };

  const release = (ripple?: ActiveRipple) => {
    if (!ripple || !ripple.element.isConnected) return;
    const wait = Math.max(0, MIN_HOLD_MS - (performance.now() - ripple.startedAt));
    window.setTimeout(() => {
      ripple.element.addEventListener("transitionend", () => ripple.element.remove(), {once: true});
      ripple.element.classList.add("is-released");
    }, wait);
  };

  const pointerDown = (event: PointerEvent) => {
    if (event.button !== 0 || event.isPrimary === false) return;
    const surface = findSurface(event.target);
    if (!surface) return;
    activePointers.set(event.pointerId, createRipple(surface, event.clientX, event.clientY));
  };

  const pointerEnd = (event: PointerEvent) => {
    const ripple = activePointers.get(event.pointerId);
    activePointers.delete(event.pointerId);
    release(ripple);
  };

  const keyDown = (event: KeyboardEvent) => {
    if (event.repeat || (event.key !== "Enter" && event.key !== " ")) return;
    const surface = findSurface(event.target);
    if (!surface) return;
    const ripple = createRipple(surface);
    window.setTimeout(() => release(ripple), MIN_HOLD_MS);
  };

  document.addEventListener("pointerdown", pointerDown, {passive: true});
  document.addEventListener("pointerup", pointerEnd, {passive: true});
  document.addEventListener("pointercancel", pointerEnd, {passive: true});
  document.addEventListener("keydown", keyDown);

  return () => {
    document.removeEventListener("pointerdown", pointerDown);
    document.removeEventListener("pointerup", pointerEnd);
    document.removeEventListener("pointercancel", pointerEnd);
    document.removeEventListener("keydown", keyDown);
    activePointers.forEach(release);
    activePointers.clear();
  };
}
