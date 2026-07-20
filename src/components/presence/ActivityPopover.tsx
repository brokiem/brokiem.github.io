import {For, Show, type Accessor} from "solid-js";
import type {ActivityStatus, ActivityVisual} from "../../data/presence-model";
import {SpotifyIcon} from "../ui/Icons";
import {ActivityProgress} from "./ActivityProgress";

type ActivityPopoverProps = {
  status: Accessor<ActivityStatus>;
  id: string;
  active: boolean;
};

export function ActivityPopover(props: ActivityPopoverProps) {
  const listening = () => props.status().activityType === 2;
  const title = () => listening() ? props.status().tooltip.lines[0] || props.status().tooltip.title : props.status().tooltip.title;
  const lines = () => listening() ? props.status().tooltip.lines.slice(1) : props.status().tooltip.lines;

  return (
    <div id={props.id} class="activity-tooltip" classList={{"activity-tooltip--listening": listening()}} role="tooltip">
      <div class="activity-tooltip-content">
        <div class="activity-tooltip-copy">
          <Show when={props.status().activityType !== 0}>
            <span class="activity-tooltip-eyebrow">{props.status().tooltip.eyebrow}</span>
          </Show>
          <span class="activity-tooltip-title">{title()}</span>
          <For each={lines()}>{(line) => <span class="activity-tooltip-line">{line}</span>}</For>
          <Show when={props.active && props.status().tooltip.progress} keyed>
            {(progress) => <ActivityProgress progress={progress}/>} 
          </Show>
        </div>
        <Show when={props.status().tooltip.visual} keyed fallback={<span class="activity-artwork activity-artwork-empty"/>}>
          {(visual) => <ActivityArtwork visual={visual}/>} 
        </Show>
      </div>
    </div>
  );
}

function ActivityArtwork(props: {visual: ActivityVisual}) {
  return (
    <span class="activity-artwork" aria-hidden="true">
      <Show
        when={props.visual.thumbnailUrl}
        keyed
        fallback={<span class="activity-artwork-empty">{props.visual.iconKind === "spotify" ? <SpotifyIcon inline={false}/> : "✦"}</span>}
      >
        {(url) => <img src={url} alt="" width="64" height="64" loading="lazy" decoding="async"/>}
      </Show>
      <Show when={props.visual.iconUrl || props.visual.iconKind}>
        <span class="activity-app-icon">
          <Show when={props.visual.iconUrl} keyed fallback={<SpotifyIcon inline={false}/>}>
            {(url) => <img src={url} alt="" width="22" height="22" loading="lazy" decoding="async"/>}
          </Show>
        </span>
      </Show>
    </span>
  );
}
