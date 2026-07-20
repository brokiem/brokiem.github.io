import {HashRouter, Route, type RouteSectionProps} from "@solidjs/router";
import {SiteNav} from "../components/layout/SiteNav";
import HomePage from "../pages/HomePage";
import ProjectsPage from "../pages/ProjectsPage";

function AppShell(props: RouteSectionProps) {
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
