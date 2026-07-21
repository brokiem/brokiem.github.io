import {createMemo, createSignal, onCleanup, Show, type Accessor} from "solid-js";
import type {ActivityProgress as ActivityProgressData} from "../../data/presence-model";
import {WavyProgress} from "./WavyProgress";

export function ActivityProgress(props: {progress: Accessor<ActivityProgressData>}) {
  const [now, setNow] = createSignal(Date.now());
  const timer = window.setInterval(() => setNow(Date.now()), 1000);
  onCleanup(() => window.clearInterval(timer));

  const info = createMemo(() => {
    const progress = props.progress();
    if (progress.start && progress.end) {
      const duration = Math.max(progress.end - progress.start, 1);
      const elapsed = Math.min(Math.max(now() - progress.start, 0), duration);
      return {label: formatDuration(elapsed), durationLabel: formatDuration(duration), value: elapsed / duration, hasBar: true};
    }
    if (progress.start) return {label: `${formatDuration(Math.max(now() - progress.start, 0))} elapsed`, durationLabel: null, value: 0, hasBar: false};
    if (progress.end) return {label: `${formatDuration(Math.max(progress.end - now(), 0))} remaining`, durationLabel: null, value: 0, hasBar: false};
    return null;
  });

  return (
    <Show when={info()}>
      {(value) => (
        <span class="activity-progress">
          <span class="activity-progress-time"><span>{value().label}</span><Show when={value().durationLabel}>{(duration) => <span>{duration()}</span>}</Show></span>
          <Show when={value().hasBar}><span class="activity-progress-track" aria-hidden="true"><WavyProgress value={value().value}/></span></Show>
        </span>
      )}
    </Show>
  );
}

function formatDuration(milliseconds: number) {
  const total = Math.floor(milliseconds / 1000);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return hours > 0
    ? `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    : `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
