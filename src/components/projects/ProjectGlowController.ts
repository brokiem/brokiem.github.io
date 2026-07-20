import {SpringController} from "../../lib/spring-controller";

type TargetCard = {element: HTMLElement; bounds: DOMRect; active: boolean};

export class ProjectGlowController {
  #active?: HTMLElement;
  #dirty = true;
  #frame = 0;
  #grid: HTMLElement;
  #paintX = 0;
  #paintY = 0;
  #resize: ResizeObserver;
  #targets: TargetCard[] = [];
  #spring: SpringController<"x" | "y">;

  constructor(grid: HTMLElement) {
    this.#grid = grid;
    this.#resize = new ResizeObserver(() => { this.#dirty = true; });
    this.#resize.observe(grid);
    this.#spring = new SpringController({x: 0, y: 0}, {stiffness: 60, damping: 13, mass: 1.15}, this.#paint);
    window.addEventListener("scroll", this.#markDirty, {passive: true});
  }

  move(event: PointerEvent) {
    if (event.pointerType === "touch") return;
    const card = event.target instanceof Element ? event.target.closest<HTMLElement>(".project-card:not(.project-card-skeleton)") : null;
    if (card !== this.#active || this.#dirty) this.#selectTargets(card ?? undefined);
    this.#spring.set({x: event.clientX, y: event.clientY});
  }

  leave() {
    this.#targets.forEach(({element}) => this.#clearCard(element));
    this.#targets = [];
    this.#active = undefined;
  }

  destroy() {
    cancelAnimationFrame(this.#frame);
    this.leave();
    this.#resize.disconnect();
    this.#spring.destroy();
    window.removeEventListener("scroll", this.#markDirty);
  }

  #markDirty = () => { this.#dirty = true; };

  #selectTargets(active?: HTMLElement) {
    this.#targets.forEach(({element}) => this.#clearCard(element));
    this.#active = active;
    this.#dirty = false;
    if (!active) {
      this.#targets = [];
      return;
    }

    const activeBounds = active.getBoundingClientRect();
    this.#targets = Array.from(this.#grid.querySelectorAll<HTMLElement>(".project-card:not(.project-card-skeleton)"))
      .map((element) => ({element, bounds: element.getBoundingClientRect(), active: element === active}))
      .filter(({bounds, active: isActive}) => isActive || rectDistance(activeBounds, bounds) < 460);
    this.#targets.forEach(({element, active: isActive}) => element.classList.add(isActive ? "is-glow-active" : "is-glow-neighbor"));
  }

  #paint = ({x, y}: Readonly<{x: number; y: number}>) => {
    this.#paintX = x;
    this.#paintY = y;
    if (this.#frame) return;
    this.#frame = requestAnimationFrame(() => {
      this.#frame = 0;
      const currentX = this.#paintX;
      const currentY = this.#paintY;
      this.#targets.forEach(({element, bounds, active}) => {
        const dx = Math.max(bounds.left - currentX, 0, currentX - bounds.right);
        const dy = Math.max(bounds.top - currentY, 0, currentY - bounds.bottom);
        const distance = Math.hypot(dx, dy);
        const glow = active ? 0.26 : Math.max(0, 1 - distance / 360) * 0.012;
        const border = active ? 0.42 : Math.max(0, 1 - distance / 420) * 0.28;
        element.style.setProperty("--project-glow-x", `${currentX - bounds.left}px`);
        element.style.setProperty("--project-glow-y", `${currentY - bounds.top}px`);
        element.style.setProperty("--project-glow-strength", glow.toFixed(3));
        element.style.setProperty("--project-glow-border-strength", border.toFixed(3));
      });
    });
  };

  #clearCard(element: HTMLElement) {
    element.classList.remove("is-glow-active", "is-glow-neighbor");
    element.style.removeProperty("--project-glow-x");
    element.style.removeProperty("--project-glow-y");
    element.style.removeProperty("--project-glow-strength");
    element.style.removeProperty("--project-glow-border-strength");
  }
}

function rectDistance(a: DOMRect, b: DOMRect) {
  const dx = Math.max(a.left - b.right, b.left - a.right, 0);
  const dy = Math.max(a.top - b.bottom, b.top - a.bottom, 0);
  return Math.hypot(dx, dy);
}
