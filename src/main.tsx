import {render} from "solid-js/web";
import {onCleanup, onMount} from "solid-js";
import {App} from "./app/App";
import {PresenceProvider} from "./data/presence-context";
import {installMaterialRipples} from "./lib/material-ripple";
import "./styles/index.css";

function Root() {
  onMount(() => {
    const removeRipples = installMaterialRipples();
    onCleanup(removeRipples);
  });
  return <PresenceProvider><App/></PresenceProvider>;
}

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root mount point");
render(() => <Root/>, root);
