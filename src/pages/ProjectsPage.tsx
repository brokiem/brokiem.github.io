import {ProjectsFooter} from "../components/layout/SiteFooter";
import {ProjectsGrid} from "../components/projects/ProjectsGrid";

export default function ProjectsPage() {
  return (
    <main class="projects-page">
      <header class="projects-hero">
        <div><span class="hero-kicker">Things that escaped the ideas folder</span><h1>A shelf of <span>side quests.</span></h1></div>
        <p>Tools, games, and experiments. Some are useful. Some taught me something. The best ones did both.</p>
      </header>
      <ProjectsGrid/>
      <ProjectsFooter/>
    </main>
  );
}
