import {A} from "@solidjs/router";
import {createSignal, onCleanup, onMount} from "solid-js";

const moods = [
  {id: "violet", label: "Material Violet"},
  {id: "blue", label: "Material Blue"},
  {id: "green", label: "Material Green"},
  {id: "oled", label: "OLED"},
] as const;

type SiteNavProps = {
  active: "home" | "projects";
};

export default function SiteNav(props: SiteNavProps) {
  const [moodIndex, setMoodIndex] = createSignal(0);
  const [isChanging, setIsChanging] = createSignal(false);
  let resetTimer: number | undefined;

  onMount(() => {
    const storedMood = window.localStorage.getItem("brokiem-mood");
    const storedIndex = moods.findIndex((mood) => mood.id === storedMood);
    const initialIndex = storedIndex >= 0 ? storedIndex : 0;

    setMoodIndex(initialIndex);
    document.documentElement.dataset.mood = moods[initialIndex].id;
  });

  onCleanup(() => window.clearTimeout(resetTimer));

  const changeMood = () => {
    const nextIndex = (moodIndex() + 1) % moods.length;
    const nextMood = moods[nextIndex];

    setMoodIndex(nextIndex);
    setIsChanging(true);
    document.documentElement.dataset.mood = nextMood.id;
    window.localStorage.setItem("brokiem-mood", nextMood.id);

    window.clearTimeout(resetTimer);
    resetTimer = window.setTimeout(() => setIsChanging(false), 520);
  };

  return (
    <header class="site-nav-wrap">
      <nav class="site-nav" aria-label="Primary navigation">
        <A class="brand-mark" href="/" aria-label="brokiem, home">
          <img src="/brokiem.webp" width="46" height="46" alt="" aria-hidden="true"/>
        </A>

        <div class="nav-links">
          <A class="nav-link" classList={{"is-active": props.active === "home"}} href="/">
            Home
          </A>
          <A
            class="nav-link"
            classList={{"is-active": props.active === "projects"}}
            href="/projects"
          >
            Projects
          </A>
        </div>

        <div class="nav-actions">
          <a
            class="nav-icon-link"
            href="https://github.com/brokiem"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub profile (opens in a new tab)"
          >
            <GitHubIcon/>
          </a>
          <button
            type="button"
            class="mood-switcher"
            classList={{"is-changing": isChanging()}}
            onClick={changeMood}
            aria-label={`Change color mood. Current mood: ${moods[moodIndex()].label}`}
            title={`Mood: ${moods[moodIndex()].label}`}
          >
            <span class="mood-switcher-dot" aria-hidden="true"/>
            <SparkIcon/>
          </button>
        </div>
      </nav>
    </header>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 2a10 10 0 0 0-3.16 19.49c.5.1.68-.22.68-.48v-1.87c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.6 9.6 0 0 1 12 6.82a9.5 9.5 0 0 1 2.5.34c1.91-1.29 2.75-1.02 2.75-1.02.54 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85V21c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/>
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 2c.5 5.35 4.65 9.5 10 10-5.35.5-9.5 4.65-10 10-.5-5.35-4.65-9.5-10-10 5.35-.5 9.5-4.65 10-10Z"/>
    </svg>
  );
}
