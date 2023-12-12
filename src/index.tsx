import {render} from "solid-js/web";
import {Route, HashRouter} from "@solidjs/router";
import * as lanyard from "lanyard-wrapper";
import {$data, $isLoading} from "./store";
import "uno.css";
import "./assets/fonts.css";
import "./assets/main.css";
import '@unocss/reset/tailwind-compat.css';
import MainPage from './pages/MainPage';
import ProjectsPage from './pages/ProjectsPage';

lanyard.connectWebSocket("548120702373593090", (data: lanyard.Data) => {
  $data.set(data);
  $isLoading.set(false);
});

render(() => (
  <HashRouter>
    <Route path="/" component={MainPage}/>
    <Route path="/projects" component={ProjectsPage}/>
  </HashRouter>
), document.getElementById("root")!);
