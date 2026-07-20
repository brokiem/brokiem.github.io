import {A, useLocation} from "@solidjs/router";
import {createSignal, onMount, Show} from "solid-js";
import {GitHubIcon, SparkIcon} from "../ui/Icons";

const themes = [
  {id: "violet", label: "Material Violet", color: "#141218"},
  {id: "blue", label: "Material Blue", color: "#111318"},
  {id: "teal", label: "Material Teal", color: "#0e1513"},
  {id: "green", label: "Material Green", color: "#101510"},
  {id: "amber", label: "Material Amber", color: "#18130b"},
  {id: "rose", label: "Material Rose", color: "#191113"},
  {id: "oled", label: "OLED", color: "#000000"},
] as const;

export function SiteNav() {
  const location = useLocation();
  const [themeIndex, setThemeIndex] = createSignal(0);
  const [themeRevision, setThemeRevision] = createSignal(0);

  onMount(() => {
    const stored = localStorage.getItem("brokiem-mood");
    const index = themes.findIndex((theme) => theme.id === stored);
    applyTheme(index >= 0 ? index : 0);
  });

  const applyTheme = (index: number) => {
    const theme = themes[index] ?? themes[0];
    setThemeIndex(index);
    document.documentElement.dataset.mood = theme.id;
    document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute("content", theme.color);
  };

  const changeTheme = () => {
    const next = (themeIndex() + 1) % themes.length;
    applyTheme(next);
    localStorage.setItem("brokiem-mood", themes[next]?.id ?? "violet");
    setThemeRevision((revision) => revision + 1);
  };

  return (
    <header class="site-nav-wrap">
      <nav class="site-nav" aria-label="Primary navigation">
        <div class="nav-links">
          <A class="nav-link" classList={{"is-active": location.pathname === "/"}} href="/" data-ripple>Home</A>
          <A class="nav-link" classList={{"is-active": location.pathname.startsWith("/projects")}} href="/projects" data-ripple>Projects</A>
        </div>

        <div class="nav-actions">
          <button
            type="button"
            class="mood-switcher"
            onClick={changeTheme}
            aria-label={`Change color mood. Current mood: ${themes[themeIndex()]?.label ?? "Material Violet"}`}
            title={`Mood: ${themes[themeIndex()]?.label ?? "Material Violet"}`}
            data-ripple
          >
            <span class="mood-switcher-dot" aria-hidden="true"/>
            <Show when={themeRevision() || undefined} keyed fallback={<SparkIcon/>}>
              {(_revision) => <span class="mood-switcher-icon"><SparkIcon/></span>}
            </Show>
          </button>
        </div>
      </nav>
    </header>
  );
}
