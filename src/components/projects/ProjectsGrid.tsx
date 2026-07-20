import {createEffect, createSignal, For, onCleanup, Show} from "solid-js";
import {usePresence} from "../../data/presence-context";
import {ProjectCard, ProjectCardSkeleton} from "./ProjectCard";
import {ProjectGlowController} from "./ProjectGlowController";
import {ProjectRevealController} from "./ProjectRevealController";

export function ProjectsGrid() {
  const presence = usePresence();
  const [grid, setGrid] = createSignal<HTMLDivElement>();
  let glow: ProjectGlowController | undefined;

  createEffect(() => {
    const element = grid();
    if (!element) return;
    let reveal: ProjectRevealController | undefined;
    let disposed = false;

    queueMicrotask(() => {
      if (disposed || !element.isConnected) return;
      const supportsGlow = matchMedia("(hover: hover) and (pointer: fine)").matches
        && !matchMedia("(prefers-reduced-motion: reduce)").matches;
      glow = supportsGlow ? new ProjectGlowController(element) : undefined;
      reveal = new ProjectRevealController(element);
    });

    onCleanup(() => {
      disposed = true;
      glow?.destroy();
      glow = undefined;
      reveal?.destroy();
    });
  });

  return (
    <Show
      when={!presence.loading()}
      fallback={<div class="projects-grid project-skeleton-grid" aria-label="Loading projects"><For each={Array.from({length: 9})}>{() => <ProjectCardSkeleton/>}</For></div>}
    >
      <Show
        when={presence.projects().length > 0}
        fallback={<div class="project-empty"><span aria-hidden="true">⌁</span><h2>The shelf is being rearranged.</h2><p>Check back soon for the next little thing.</p></div>}
      >
        <div
          ref={(element) => setGrid(element)}
          class="projects-grid"
          onPointerMove={(event) => glow?.move(event)}
          onPointerLeave={() => glow?.leave()}
        >
          <For each={presence.projects()}>{(project, index) => <ProjectCard project={project} index={index()}/>}</For>
        </div>
      </Show>
    </Show>
  );
}
