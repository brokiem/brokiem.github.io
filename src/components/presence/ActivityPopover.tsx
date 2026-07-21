import {createMemo, For, Show, type Accessor} from "solid-js";
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

  return (
    <div id={props.id} class="activity-tooltip" classList={{"activity-tooltip--listening": listening()}} role="tooltip">
      <ActivityDetails status={props.status} active={props.active}/>
    </div>
  );
}

export function ActivityDetails(props: Pick<ActivityPopoverProps, "status" | "active">) {
  const details = createMemo(() => {
    const status = props.status();
    const listening = status.activityType === 2;
    return {
      activityType: status.activityType,
      eyebrow: status.tooltip.eyebrow,
      lines: listening ? status.tooltip.lines.slice(1, 2) : status.tooltip.lines,
      progress: status.tooltip.progress,
      title: listening ? status.tooltip.lines[0] || status.tooltip.title : status.tooltip.title,
      visual: status.tooltip.visual,
    };
  });

  return (
    <div class="activity-tooltip-content">
      <div class="activity-tooltip-copy">
        <Show when={details().activityType !== 0}>
          <span class="activity-tooltip-eyebrow">{details().eyebrow}</span>
        </Show>
        <span class="activity-tooltip-title">{details().title}</span>
        <For each={details().lines}>{(line) => <span class="activity-tooltip-line">{line}</span>}</For>
        <Show when={props.active && details().progress}>
          {(progress) => <ActivityProgress progress={progress}/>}
        </Show>
      </div>
      <Show when={details().visual} fallback={<span class="activity-artwork activity-artwork-empty"/>}>
        {(visual) => <ActivityArtwork visual={visual}/>}
      </Show>
    </div>
  );
}

function ActivityArtwork(props: {visual: Accessor<ActivityVisual>}) {
  return (
    <span class="activity-artwork" aria-hidden="true">
      <Show
        when={props.visual().thumbnailUrl}
        keyed
        fallback={<span class="activity-artwork-empty">{props.visual().iconKind === "spotify" ? <SpotifyIcon inline={false}/> : "✦"}</span>}
      >
        {(url) => <img src={url} alt="" width="64" height="64" loading="lazy" decoding="async"/>}
      </Show>
      <Show when={props.visual().iconUrl || props.visual().iconKind}>
        <span class="activity-app-icon">
          <Show when={props.visual().iconUrl} keyed fallback={<SpotifyIcon inline={false}/>}>
            {(url) => <img src={url} alt="" width="22" height="22" loading="lazy" decoding="async"/>}
          </Show>
        </span>
      </Show>
    </span>
  );
}
