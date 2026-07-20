const CARD_SELECTOR = ".project-card:not(.project-card-skeleton)";
const STAGGER_DELAYS = [0, 45, 96, 138, 188, 232];

export class ProjectRevealController {
  #cards: HTMLElement[];
  #frame?: number;
  #grid: HTMLElement;
  #observer?: IntersectionObserver;

  constructor(grid: HTMLElement) {
    this.#grid = grid;
    this.#cards = Array.from(grid.querySelectorAll<HTMLElement>(CARD_SELECTOR));
    grid.classList.add("is-reveal-ready");

    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.#cards.forEach((card) => this.#reveal(card, 0));
      return;
    }

    this.#observer = new IntersectionObserver(this.#intersect, {
      rootMargin: "0px 0px -8% 0px",
      threshold: 0.12,
    });
    grid.addEventListener("focusin", this.#focus);
    this.#frame = requestAnimationFrame(() => {
      this.#cards.forEach((card) => this.#observer?.observe(card));
    });
  }

  destroy() {
    if (this.#frame !== undefined) cancelAnimationFrame(this.#frame);
    this.#observer?.disconnect();
    this.#grid.removeEventListener("focusin", this.#focus);
  }

  #focus = (event: FocusEvent) => {
    const card = event.target instanceof Element ? event.target.closest<HTMLElement>(CARD_SELECTOR) : null;
    if (card) this.#reveal(card, 0);
  };

  #intersect = (entries: IntersectionObserverEntry[]) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting && !entry.target.classList.contains("is-revealed"))
      .sort((a, b) => a.target.compareDocumentPosition(b.target) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);

    visible.forEach((entry, index) => {
      const card = entry.target as HTMLElement;
      this.#reveal(card, STAGGER_DELAYS[index] ?? Math.min(index * 46, 250));
    });
  };

  #reveal(card: HTMLElement, delay: number) {
    card.style.setProperty("--project-reveal-delay", `${delay}ms`);
    card.classList.add("is-revealed");
    this.#observer?.unobserve(card);
  }
}
