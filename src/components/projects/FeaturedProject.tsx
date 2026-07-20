import {Show} from "solid-js";
import {usePresence} from "../../data/presence-context";
import type {Project} from "../../data/presence-model";
import {ProjectIllustration} from "./ProjectIllustration";

export function FeaturedProject() {
  const presence = usePresence();

  return (
    <section class="expressive-card latest-card" aria-labelledby="featured-heading">
      <div class="latest-copy">
        <span class="card-eyebrow" id="featured-heading">Featured project</span>
        <Show when={!presence.loading()} fallback={<span class="latest-project-skeleton" aria-label="Loading featured project"/>}>
          <Show when={presence.featuredProject()} keyed fallback={<p>Something new is still taking shape.</p>}>
            {(project) => <FeaturedDetails project={project}/>} 
          </Show>
        </Show>
      </div>
      <div class="latest-visual" aria-hidden="true">
        <ProjectIllustration name={presence.featuredProject()?.name || "Featured"} variant={(presence.featuredProject()?.name.length || 0) % 4}/>
      </div>
    </section>
  );
}

function FeaturedDetails(props: {project: Project}) {
  return (
    <div class="latest-project-details">
      <h3>{props.project.name}</h3>
      <p>{props.project.desc || props.project.stack}</p>
      <a class="latest-link" href={props.project.url || props.project.github || "/#/projects"} data-ripple>Take a look</a>
    </div>
  );
}
