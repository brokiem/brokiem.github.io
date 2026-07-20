import {createSignal, onCleanup, Show} from "solid-js";
import type {Project} from "../../data/presence-model";
import {shareContent} from "../../lib/share";
import {CheckIcon, ChevronIcon, GitHubIcon, ShareIcon} from "../ui/Icons";
import {ProjectIllustration} from "./ProjectIllustration";
import {projectPaletteStyle} from "./project-palette";

export function ProjectCard(props: {project: Project; index: number}) {
  const [shareState, setShareState] = createSignal<"idle" | "copied">("idle");
  let resetTimer = 0;
  onCleanup(() => window.clearTimeout(resetTimer));
  const technology = () => props.project.stack.split(/\s*[,/·|]\s*/).filter(Boolean)[0];
  const destination = () => props.project.url || props.project.github;

  const share = async () => {
    const url = props.project.url || props.project.github;
    if (!url) return;
    const result = await shareContent({title: props.project.name, text: props.project.desc, url});
    if (result !== "copied") return;
    setShareState("copied");
    window.clearTimeout(resetTimer);
    resetTimer = window.setTimeout(() => setShareState("idle"), 1800);
  };

  return (
    <article class="project-card" style={projectPaletteStyle(props.project.name, props.index)} data-ripple>
      <div class="project-media">
        <ProjectIllustration name={props.project.name} variant={props.index}/>
        <Show when={props.project.img} keyed>
          {(url) => (
            <img
              src={url}
              alt={`${props.project.name} preview`}
              width="720"
              height="440"
              loading={props.index < 2 ? "eager" : "lazy"}
              fetchpriority={props.index < 2 ? "high" : "auto"}
              decoding="async"
              onError={(event) => event.currentTarget.classList.add("is-broken")}
            />
          )}
        </Show>
      </div>

      <div class="project-content">
        <div class="project-copy">
          <div class="project-title-row">
            <h2>
              <Show when={destination()} keyed fallback={props.project.name}>
                {(url) => (
                  <a class="project-card-primary-link" href={url} target="_blank" rel="noreferrer">
                    {props.project.name}
                  </a>
                )}
              </Show>
            </h2>
          </div>
          <p>{props.project.desc}</p>
          <Show when={technology()} keyed>{(value) => <span class="project-meta">{value}</span>}</Show>
        </div>
        <div class="project-actions">
          <Show when={destination()}>
            <span class="project-view-action" aria-hidden="true">
              {props.project.url ? "View project" : "View source"}
              <ChevronIcon/>
            </span>
          </Show>
          <div class="project-icon-actions">
            <Show when={props.project.github}>
              <a href={props.project.github} target="_blank" rel="noreferrer" aria-label={`${props.project.name} source code on GitHub`} data-ripple><GitHubIcon/></a>
            </Show>
            <button type="button" onClick={share} aria-label={`Share ${props.project.name}`} data-ripple>
              <Show when={shareState() === "copied"} fallback={<ShareIcon/>}><CheckIcon/></Show>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function ProjectCardSkeleton() {
  return <div class="project-card project-card-skeleton"><span/></div>;
}
