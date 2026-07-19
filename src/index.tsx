import {render} from "solid-js/web";
import {Route, HashRouter, type RouteSectionProps} from "@solidjs/router";
import '@unocss/reset/tailwind-compat.css';
import "./assets/fonts.css";
import "./assets/main.css";
import MainPage from "./pages/MainPage";
import ProjectsPage from "./pages/ProjectsPage";
import SiteNav from "./components/SiteNav";
import {startLivePresence} from "./livePresence";

const AppShell = (props: RouteSectionProps) => (
  <div class="site-shell">
    <SiteNav active={props.location.pathname.startsWith("/projects") ? "projects" : "home"}/>
    {props.children}
  </div>
);

const rippleSelector = [
  "button",
  "a.action-link",
  "a.project-view-link",
  ".project-icon-actions a",
  "a.nav-link",
  "a.nav-icon-link",
  "a.brand-mark",
  "a.latest-link",
].join(",");

const findRippleSurface = (target: EventTarget | null) => {
  if (!(target instanceof Element)) return null;
  const surface = target.closest(rippleSelector) as HTMLElement | null;
  if (!surface || surface.matches(":disabled, [aria-disabled='true']")) return null;
  return surface;
};

const addMaterialRipple = (surface: HTMLElement, clientX?: number, clientY?: number) => {
  const bounds = surface.getBoundingClientRect();
  const x = clientX === undefined ? bounds.width / 2 : clientX - bounds.left;
  const y = clientY === undefined ? bounds.height / 2 : clientY - bounds.top;
  const radius = Math.hypot(Math.max(x, bounds.width - x), Math.max(y, bounds.height - y));
  const ripple = document.createElement("span");

  surface.classList.add("material-ripple-surface");
  ripple.className = "material-ripple";
  ripple.style.setProperty("--material-ripple-size", `${radius * 2}px`);
  ripple.style.setProperty("--material-ripple-x", `${x - radius}px`);
  ripple.style.setProperty("--material-ripple-y", `${y - radius}px`);
  ripple.addEventListener("animationend", () => ripple.remove(), {once: true});
  surface.append(ripple);
};

document.addEventListener("pointerdown", (event) => {
  if (event.button !== 0) return;
  const surface = findRippleSurface(event.target);
  if (surface) addMaterialRipple(surface, event.clientX, event.clientY);
});

document.addEventListener("keydown", (event) => {
  if (event.repeat || (event.key !== "Enter" && event.key !== " ")) return;
  const surface = findRippleSurface(event.target);
  if (surface) addMaterialRipple(surface);
});

render(() => (
  <HashRouter root={AppShell}>
    <Route path="/" component={MainPage}/>
    <Route path="/projects" component={ProjectsPage}/>
  </HashRouter>
), document.getElementById("root")!);

if ("requestIdleCallback" in window) {
  window.requestIdleCallback(startLivePresence, {timeout: 1000});
} else {
  globalThis.setTimeout(startLivePresence, 0);
}
