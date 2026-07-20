import {Index, Show} from "solid-js";
import {usePresence} from "../../data/presence-context";
import type {PresenceStatus} from "../../data/presence-model";
import {ActivitySignal} from "./ActivitySignal";

export function StatusCard() {
  const presence = usePresence();
  const contentSize = () => `${Math.max(presence.activities().length, 1) * 62 - 4}px`;

  return (
    <section class="expressive-card status-card" aria-labelledby="status-heading">
      <div class="card-heading-row">
        <div><span class="card-eyebrow">Live signal</span><h2 id="status-heading">Right now</h2></div>
        <span class="signal-equalizer" aria-hidden="true">
          <svg viewBox="0 0 24 24"><rect x="3" y="8" width="4" height="8" rx="2"/><rect x="10" y="3" width="4" height="18" rx="2"/><rect x="17" y="6" width="4" height="12" rx="2"/></svg>
        </span>
      </div>

      <div class="status-copy" style={{"--status-content-size": contentSize()}}>
        <Show when={presence.activities().length > 0} fallback={<StatusFallback status={presence.status()}/>}>
          <div class="activity-signals">
            <Index each={presence.activities()}>
              {(activity) => <ActivitySignal status={activity} tooltipId={`activity-tooltip-${activity().activityId}`}/>} 
            </Index>
          </div>
        </Show>
      </div>
    </section>
  );
}

function StatusFallback(props: {status: PresenceStatus | null}) {
  if (!props.status) return <span class="status-loading">Tuning in<span class="loading-dots" aria-hidden="true">...</span></span>;
  if (props.status.type === "offline") return <span>Touching some grass <span aria-hidden="true">🌾</span></span>;
  return <span>Between adventures <span aria-hidden="true">☕</span></span>;
}
