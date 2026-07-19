import {useStore} from "@nanostores/solid";
import {createSignal, For, Show} from "solid-js";
import ProjectIllustration, {getProjectPaletteStyle} from "../components/ProjectIllustration";
import {$isLoading, $projects, Project} from "../store";

type ProjectGlowState = {
  activeCard: HTMLElement | null;
  cards: Array<{card: HTMLElement; bounds: DOMRect}>;
  currentX: number;
  currentY: number;
  frame: number | null;
  scrollX: number;
  scrollY: number;
  targetX: number;
  targetY: number;
};

const projectGlowStates = new WeakMap<HTMLElement, ProjectGlowState>();
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const measureProjectCards = (grid: HTMLElement) => (
  Array.from(grid.querySelectorAll<HTMLElement>(".project-card"), (card) => ({
    card,
    bounds: card.getBoundingClientRect(),
  }))
);

const refreshProjectGlowLayout = (grid: HTMLElement, state: ProjectGlowState) => {
  if (state.scrollX === window.scrollX && state.scrollY === window.scrollY) return;
  state.cards = measureProjectCards(grid);
  state.scrollX = window.scrollX;
  state.scrollY = window.scrollY;
};

const paintProjectGlow = (grid: HTMLElement, state: ProjectGlowState) => {
  refreshProjectGlowLayout(grid, state);
  state.cards.forEach(({card, bounds}) => {
    const distanceX = Math.max(bounds.left - state.currentX, 0, state.currentX - bounds.right);
    const distanceY = Math.max(bounds.top - state.currentY, 0, state.currentY - bounds.bottom);
    const distance = Math.hypot(distanceX, distanceY);
    const isActiveCard = card === state.activeCard;
    const strength = isActiveCard ? 0.26 : Math.max(0, 1 - distance / 360) * 0.012;
    const borderStrength = isActiveCard ? 0.42 : Math.max(0, 1 - distance / 420) * 0.28;

    card.style.setProperty("--project-glow-x", `${state.currentX - bounds.left}px`);
    card.style.setProperty("--project-glow-y", `${state.currentY - bounds.top}px`);
    card.style.setProperty("--project-glow-strength", strength.toFixed(3));
    card.style.setProperty("--project-glow-border-strength", borderStrength.toFixed(3));
  });
};

const animateProjectGlow = (grid: HTMLElement, state: ProjectGlowState) => {
  const deltaX = state.targetX - state.currentX;
  const deltaY = state.targetY - state.currentY;

  state.currentX += deltaX * 0.09;
  state.currentY += deltaY * 0.09;
  paintProjectGlow(grid, state);

  if (Math.abs(deltaX) > 0.2 || Math.abs(deltaY) > 0.2) {
    state.frame = requestAnimationFrame(() => animateProjectGlow(grid, state));
  } else {
    state.currentX = state.targetX;
    state.currentY = state.targetY;
    paintProjectGlow(grid, state);
    state.frame = null;
  }
};

const illuminateProjectCards = (event: PointerEvent) => {
  if (event.pointerType === "touch") return;

  const grid = event.currentTarget as HTMLElement;
  const activeCard = event.target instanceof Element
    ? event.target.closest<HTMLElement>(".project-card")
    : null;
  let state = projectGlowStates.get(grid);

  if (!state) {
    state = {
      activeCard,
      cards: measureProjectCards(grid),
      currentX: event.clientX,
      currentY: event.clientY,
      frame: null,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      targetX: event.clientX,
      targetY: event.clientY,
    };
    projectGlowStates.set(grid, state);
    paintProjectGlow(grid, state);
    return;
  }

  state.activeCard = activeCard;
  state.targetX = event.clientX;
  state.targetY = event.clientY;

  if (reducedMotion.matches) {
    state.currentX = state.targetX;
    state.currentY = state.targetY;
    paintProjectGlow(grid, state);
    return;
  }

  if (state.frame === null) {
    state.frame = requestAnimationFrame(() => animateProjectGlow(grid, state));
  }
};

const resetProjectCards = (event: PointerEvent) => {
  const grid = event.currentTarget as HTMLElement;
  const state = projectGlowStates.get(grid);
  if (state?.frame !== null && state?.frame !== undefined) cancelAnimationFrame(state.frame);
  projectGlowStates.delete(grid);

  const cards = state?.cards.map(({card}) => card) ?? grid.querySelectorAll<HTMLElement>(".project-card");
  cards.forEach((card) => {
    card.style.removeProperty("--project-glow-x");
    card.style.removeProperty("--project-glow-y");
    card.style.removeProperty("--project-glow-strength");
    card.style.removeProperty("--project-glow-border-strength");
  });
};

const ProjectsPage = () => {
  const projects = useStore($projects);
  const isLoading = useStore($isLoading);

  return (
    <main class="projects-page">
      <header class="projects-hero page-enter">
        <div>
          <span class="hero-kicker">Things that escaped the ideas folder</span>
          <h1>A shelf of <span>side quests.</span></h1>
        </div>
        <p>
          Tools, games, and experiments. Some are useful. Some taught me something. The best ones did both.
        </p>
      </header>

      <Show
        when={!isLoading()}
        fallback={
          <div class="projects-grid project-skeleton-grid" aria-label="Loading projects">
            <For each={Array.from({length: 9})}>{() => <ProjectCardSkeleton/>}</For>
          </div>
        }
      >
        <Show
          when={projects().length > 0}
          fallback={
            <div class="project-empty">
              <span aria-hidden="true">⌁</span>
              <h2>The shelf is being rearranged.</h2>
              <p>Check back soon for the next little thing.</p>
            </div>
          }
        >
          <div
            class="projects-grid page-enter-delayed"
            onPointerMove={illuminateProjectCards}
            onPointerLeave={resetProjectCards}
          >
            <For each={projects()}>
              {(project, index) => <ProjectCard project={project} index={index()}/>}
            </For>
          </div>
        </Show>
      </Show>

      <footer class="site-footer projects-footer">
        <span>End of shelf. Start of another idea.</span>
        <a href="https://github.com/brokiem" target="_blank" rel="noreferrer">More scraps on GitHub</a>
      </footer>
    </main>
  );
};

const ProjectCard = ({project, index}: { project: Project; index: number }) => {
  const [shareState, setShareState] = createSignal<"idle" | "copied">("idle");
  const paletteStyle = getProjectPaletteStyle(project.name, index);

  const shareProject = async () => {
    const url = project.url || project.github;
    if (!url) return;

    try {
      if (navigator.share) {
        await navigator.share({title: project.name, text: project.desc, url});
      } else {
        await navigator.clipboard.writeText(url);
        setShareState("copied");
        window.setTimeout(() => setShareState("idle"), 1800);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      await navigator.clipboard.writeText(url);
      setShareState("copied");
      window.setTimeout(() => setShareState("idle"), 1800);
    }
  };

  const tags = () => project.stack
    .split(/\s*[,/·|]\s*/)
    .filter(Boolean)
    .slice(0, 3);

  const primaryTechnology = () => tags()[0];

  return (
    <article class="project-card" style={paletteStyle}>
      <div class="project-media">
        <ProjectIllustration name={project.name} variant={index}/>
        <Show when={project.img} keyed>
          {(imageUrl) => (
            <img
              src={imageUrl}
              alt={`${project.name} preview`}
              width="720"
              height="440"
              loading={index < 2 ? "eager" : "lazy"}
              decoding="async"
              onError={(event) => event.currentTarget.classList.add("is-broken")}
            />
          )}
        </Show>
        <Show when={primaryTechnology()} keyed>
          {(technology) => <span class="project-tech-badge">{technology}</span>}
        </Show>
      </div>

      <div class="project-content">
        <div class="project-copy">
          <div class="project-title-row">
            <h2>{project.name}</h2>
          </div>
          <p>{project.desc}</p>
        </div>

        <div class="project-actions">
          <Show when={project.url}>
            <a class="project-view-link" href={project.url} target="_blank" rel="noreferrer">
              Open project
            </a>
          </Show>

          <div class="project-icon-actions">
            <Show when={project.github}>
              <a href={project.github} target="_blank" rel="noreferrer" aria-label={`${project.name} source code on GitHub`}>
                <GitHubIcon/>
              </a>
            </Show>
            <button type="button" onClick={shareProject} aria-label={`Share ${project.name}`}>
              <Show when={shareState() === "copied"} fallback={<ShareIcon/>}>
                <CheckIcon/>
              </Show>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

const ProjectCardSkeleton = () => (
  <div class="project-card project-card-skeleton">
    <span/>
  </div>
);

function GitHubIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-3.16 19.49c.5.1.68-.22.68-.48v-1.87c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.6 9.6 0 0 1 12 6.82a9.5 9.5 0 0 1 2.5.34c1.91-1.29 2.75-1.02 2.75-1.02.54 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85V21c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/></svg>;
}

function ShareIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18 22q-1.25 0-2.13-.88A2.9 2.9 0 0 1 15 19q0-.18.03-.36.02-.19.07-.34l-7.05-4.1q-.43.38-.95.59A2.8 2.8 0 0 1 6 15q-1.25 0-2.13-.88A2.9 2.9 0 0 1 3 12q0-1.25.87-2.13A2.9 2.9 0 0 1 6 9q.58 0 1.1.21.52.22.95.59l7.05-4.1a2.8 2.8 0 0 1-.1-.7q0-1.25.87-2.13A2.9 2.9 0 0 1 18 2q1.25 0 2.13.87A2.9 2.9 0 0 1 21 5q0 1.25-.87 2.13A2.9 2.9 0 0 1 18 8q-.58 0-1.1-.21a3.3 3.3 0 0 1-.95-.59L8.9 11.3q.05.15.08.34Q9 11.82 9 12t-.02.36q-.03.19-.08.34l7.05 4.1q.43-.38.95-.59A2.8 2.8 0 0 1 18 16q1.25 0 2.13.87A2.9 2.9 0 0 1 21 19q0 1.25-.87 2.12A2.9 2.9 0 0 1 18 22Z"/></svg>;
}

function CheckIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m9.2 17.2-4.4-4.4 1.4-1.4 3 3 8.6-8.6 1.4 1.4-10 10Z"/></svg>;
}

export default ProjectsPage;
