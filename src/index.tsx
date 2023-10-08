import {render} from "solid-js/web";
import {hashIntegration, Route, Router, Routes} from "@solidjs/router";
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
  <Router source={hashIntegration()}>
    <Routes>
      <Route path="/" element={<MainPage/>}/>
      <Route path="/projects" element={<ProjectsPage/>}/>
    </Routes>
  </Router>
), document.getElementById("root")!);
