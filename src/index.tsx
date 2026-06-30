import {render} from "solid-js/web";
import {Route, HashRouter} from "@solidjs/router";
import {lazy, Suspense} from "solid-js";
import * as lanyard from "lanyard-wrapper";
import {$data, $isLoading} from "./store";
import "uno.css";
import "./assets/fonts.css";
import "./assets/main.css";
import '@unocss/reset/tailwind-compat.css';
import MainPage from "./pages/MainPage";

const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));

const connectLanyard = () => lanyard.connectWebSocket("548120702373593090", (data: lanyard.Data) => {
  $data.set(data);
  $isLoading.set(false);
});

render(() => (
  <Suspense>
    <HashRouter>
      <Route path="/" component={MainPage}/>
      <Route path="/projects" component={ProjectsPage}/>
    </HashRouter>
  </Suspense>
), document.getElementById("root")!);

if ("requestIdleCallback" in window) {
  window.requestIdleCallback(connectLanyard, {timeout: 1000});
} else {
  globalThis.setTimeout(connectLanyard, 0);
}
