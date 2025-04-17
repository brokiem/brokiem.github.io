import {useStore} from "@nanostores/solid";
import {$projects, Project} from "../store";
import {For, Index} from "solid-js";

const ProjectsPage = () => {
  const projects = useStore($projects);

  return (
    <>
      <div
        id={"container"}
        class={"max-w-4xl slide-up"}
        items={"center"}
        m={"t-10 x-auto"}
        p={"x-4"}>
        <h1 class={"leading-none"} text={"center 4xl"} font={"bold"} m={"1"}>Projects</h1>
        <p text={"center"} m={"0"}>A collection of my projects are shown here.</p>

        <div flex={"~ col"} gap={"5"} m={"t-10 b-20"}>
          <For each={projects()}
               fallback={<Index each={[...Array(23).keys()]}>{() => <ProjectCardSkeleton/>}</Index>}>
            {(project) => <ProjectCard project={project}/>}
          </For>
        </div>
      </div>
    </>
  );
};

const ProjectCard = ({project}: { project: Project }) => {
  return (
    <>
      <div flex={"~ col"} bg={"#271d1a"} rounded={"3xl"} p={"b-3"}>
        <div flex={"~"} justify={"between"} p={"5 b-0"}>
          <div class={"leading-normal"} flex={"~ col"} justify={"between"}>
            <h1 font={"extrabold"} text={"2xl"} m={"0"}>{project.name}</h1>
            <p text={"0.9rem gray-300"} m={"0 b-7"}>{project.stack}</p>

            <p text={"base gray-300"} m={"0"}>{project.desc}</p>
          </div>
        </div>

        <div p={"5 b-3 t-5"} flex={"~"} justify={"between"}>
          <ViewButton text={"View"} url={project.url}/>

          <div flex={"~"} gap={"2"}>
            <GitHubButton url={project.github}/>
            <ShareButton url={project.github}/>
          </div>
        </div>
      </div>
    </>
  )
};

const ProjectCardSkeleton = () => {
  return (
    <div
      flex={"~"}
      animate={"pulse"}
      h={"14.4rem"}
      bg={"#271d1a"}
      rounded={"3xl"}
    />
  )
}

export function ViewButton({text, url}: { text: string, url: string }) {
  return (
    <>
      <a
        href={url}
        class={"text-[#4A0F13] hover:bg-[#ffb59c]"}
        bg={"#ebc2b4"}
        flex={"~ initial"}
        text={"center sm"}
        align={"middle"}
        rounded={"full"}
        font={"semibold"}
        transition={"all"}
        duration={"300"}
        p={"x-10 y-2.5"}
        leading={"none"}
        no-underline
      >
        <span>{text}</span>
      </a>
    </>
  )
}

export function GitHubButton({url}: { url: string }) {
  return (
    <>
      <a
        href={url}
        class={"text-[#4A0F13] hover:bg-[#ffb59c]"}
        bg={"#ebc2b4"}
        flex={"~ initial"}
        text={"center sm"}
        align={"middle"}
        rounded={"full"}
        transition={"all"}
        duration={"300"}
        p={"1.5"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path style="fill: #513030;"
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      </a>
    </>
  )
}

export function ShareButton({url}: { url: string }) {
  return (
    <>
      <button
        onClick={() => navigator.clipboard.writeText(url)}
        class={"text-[#4A0F13] hover:bg-[#ffb59c]"}
        bg={"#ebc2b4"}
        flex={"~ initial"}
        text={"center sm"}
        align={"middle"}
        rounded={"full"}
        font={"semibold"}
        transition={"all"}
        duration={"300"}
        p={"1.5"}
        no-underline
      >
        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
          <path d="M0 0h24v24H0V0z" fill="none"/>
          <path style="fill: #513030;"
                d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92zM18 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM6 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm12 7.02c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
        </svg>
      </button>
    </>
  )
}

export default ProjectsPage;
