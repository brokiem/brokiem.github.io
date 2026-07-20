import {createContext, createMemo, createSignal, onCleanup, onMount, type ParentProps, useContext} from "solid-js";
import {LanyardClient} from "./lanyard-client";
import type {LanyardData} from "./lanyard.types";
import {deriveActivityStatuses, deriveStatus, parseFeaturedProjectJson, parseProjectsJson} from "./presence-model";

function createPresenceState() {
  const [data, setData] = createSignal<LanyardData>();
  const [loading, setLoading] = createSignal(true);
  const projectsJson = createMemo(() => data()?.kv?.projects);
  const featuredProjectJson = createMemo(() => data()?.kv?.featured_project ?? data()?.kv?.latest_project);

  return {
    data,
    loading,
    status: createMemo(() => deriveStatus(data())),
    activities: createMemo(() => deriveActivityStatuses(data())),
    projects: createMemo(() => parseProjectsJson(projectsJson())),
    featuredProject: createMemo(() => parseFeaturedProjectJson(featuredProjectJson())),
    setData,
    setLoading,
  };
}

type PresenceContextValue = ReturnType<typeof createPresenceState>;
const PresenceContext = createContext<PresenceContextValue>();

export function PresenceProvider(props: ParentProps) {
  const state = createPresenceState();

  onMount(() => {
    const client = new LanyardClient({
      onData: (nextData) => {
        state.setData(nextData);
        state.setLoading(false);
      },
      onInitialSettled: () => state.setLoading(false),
    });
    client.start();
    onCleanup(() => client.stop());
  });

  return <PresenceContext.Provider value={state}>{props.children}</PresenceContext.Provider>;
}

export function usePresence() {
  const value = useContext(PresenceContext);
  if (!value) throw new Error("usePresence must be used within PresenceProvider");
  return value;
}
