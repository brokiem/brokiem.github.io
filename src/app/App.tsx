import {HashRouter, Route, type RouteSectionProps, useLocation} from "@solidjs/router";
import {createRenderEffect, on} from "solid-js";
import {SiteNav} from "../components/layout/SiteNav";
import HomePage from "../pages/HomePage";
import ProjectsPage from "../pages/ProjectsPage";

function AppShell(props: RouteSectionProps) {
  const location = useLocation();

  createRenderEffect(on(
    () => location.pathname,
    () => {
      window.scrollTo({top: 0, left: 0, behavior: "instant"});
    },
    {defer: true},
  ));

  return <div class="site-shell"><SiteNav/>{props.children}</div>;
}

export function App() {
  return (
    <HashRouter root={AppShell}>
      <Route path="/" component={HomePage}/>
      <Route path="/projects" component={ProjectsPage}/>
    </HashRouter>
  );
}
