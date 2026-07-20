import {createSignal, type Accessor} from "solid-js";
import type {ActivityStatus} from "../../data/presence-model";
import {GamepadIcon, SpotifyIcon} from "../ui/Icons";
import {ActivityPopover} from "./ActivityPopover";

type ActivitySignalProps = {
  status: Accessor<ActivityStatus>;
  tooltipId: string;
};

export function ActivitySignal(props: ActivitySignalProps) {
  const [open, setOpen] = createSignal(false);
  const [hovered, setHovered] = createSignal(false);
  const [focused, setFocused] = createSignal(false);
  const active = () => open() || hovered() || focused();

  return (
    <div
      class={`activity-signal activity-signal--${props.status().activityType}`}
      classList={{"is-open": open()}}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocusIn={() => setFocused(true)}
      onFocusOut={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setFocused(false);
          setOpen(false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        setOpen(false);
        event.currentTarget.querySelector("button")?.focus();
      }}
    >
      <button
        type="button"
        class="status-popover-trigger"
        aria-describedby={props.tooltipId}
        aria-expanded={open()}
        onClick={() => setOpen((value) => !value)}
        data-ripple
      >
        <span class="activity-signal-icon">
          {props.status().activityType === 2 ? <SpotifyIcon/> : <GamepadIcon class="status-icon"/>}
        </span>
        <span class="activity-signal-copy">
          <small>{props.status().tooltip.eyebrow}</small>
          <strong>{props.status().tooltip.title}</strong>
        </span>
        <span class="activity-signal-chevron" aria-hidden="true">›</span>
      </button>
      <ActivityPopover status={props.status} id={props.tooltipId} active={active()}/>
    </div>
  );
}
