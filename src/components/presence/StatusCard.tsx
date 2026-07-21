import {createEffect, createMemo, createSignal, Index, onCleanup, onMount, Show, untrack} from "solid-js";
import {usePresence} from "../../data/presence-context";
import type {ActivityStatus, PresenceStatus} from "../../data/presence-model";
import {ActivityDetails} from "./ActivityPopover";
import {ActivitySignal} from "./ActivitySignal";

const RICH_ACTIVITY_TYPES = new Set([2, 3]);
const ACTIVITY_TRANSITION_DURATION = 520;

export function StatusCard() {
  const presence = usePresence();
  const [inlineActivity, setInlineActivity] = createSignal<ActivityStatus>();
  const [compactActivities, setCompactActivities] = createSignal<ActivityStatus[]>([]);
  const [richContentSize, setRichContentSize] = createSignal(132);
  const activities = createMemo(() => presence.activities());
  const richActivity = createMemo(() => {
    const currentActivities = activities();
    const activity = currentActivities.length === 1 ? currentActivities[0] : undefined;
    return activity && RICH_ACTIVITY_TYPES.has(activity.activityType) ? activity : undefined;
  });
  const richMode = createMemo(() => Boolean(richActivity()));
  const contentSize = createMemo(() => richMode() ? `${richContentSize()}px` : `${Math.max(activities().length, 1) * 62 - 4}px`);
  let inlinePanel: HTMLDivElement | undefined;
  let inlineResizeObserver: ResizeObserver | undefined;
  let clearInlineTimer: number | undefined;
  let settleCompactTimer: number | undefined;
  let wasRichActivity = false;

  createEffect(() => {
    const currentActivities = activities();
    const activity = richActivity();

    if (activity) {
      if (clearInlineTimer !== undefined) window.clearTimeout(clearInlineTimer);
      clearInlineTimer = undefined;
      setInlineActivity(activity);

      if (!wasRichActivity) {
        if (settleCompactTimer !== undefined) window.clearTimeout(settleCompactTimer);
        settleCompactTimer = window.setTimeout(() => {
          settleCompactTimer = undefined;
          setCompactActivities([]);
        }, ACTIVITY_TRANSITION_DURATION);
      }
    } else {
      if (settleCompactTimer !== undefined) window.clearTimeout(settleCompactTimer);
      settleCompactTimer = undefined;
      setCompactActivities(currentActivities);

      if (untrack(inlineActivity) && clearInlineTimer === undefined) {
        clearInlineTimer = window.setTimeout(() => {
          clearInlineTimer = undefined;
          inlineResizeObserver?.disconnect();
          inlinePanel = undefined;
          setInlineActivity(undefined);
        }, ACTIVITY_TRANSITION_DURATION);
      }
    }

    wasRichActivity = Boolean(activity);
  });

  const updateRichContentSize = () => {
    if (inlinePanel) setRichContentSize(inlinePanel.offsetHeight);
  };

  const captureInlinePanel = (element: HTMLDivElement) => {
    inlineResizeObserver?.disconnect();
    inlinePanel = element;
    inlineResizeObserver?.observe(element);
    queueMicrotask(() => {
      if (inlinePanel === element) updateRichContentSize();
    });
  };

  onMount(() => {
    inlineResizeObserver = new ResizeObserver(updateRichContentSize);
    if (inlinePanel) inlineResizeObserver.observe(inlinePanel);
  });

  onCleanup(() => {
    inlineResizeObserver?.disconnect();
    if (clearInlineTimer !== undefined) window.clearTimeout(clearInlineTimer);
    if (settleCompactTimer !== undefined) window.clearTimeout(settleCompactTimer);
  });

  return (
    <section class="expressive-card status-card" aria-labelledby="status-heading">
      <div class="card-heading-row">
        <div><span class="card-eyebrow">Live signal</span><h2 id="status-heading">Right now</h2></div>
        <span class="signal-equalizer" aria-hidden="true">
          <svg viewBox="0 0 24 24"><rect x="3" y="8" width="4" height="8" rx="2"/><rect x="10" y="3" width="4" height="18" rx="2"/><rect x="17" y="6" width="4" height="12" rx="2"/></svg>
        </span>
      </div>

      <div
        class="status-copy"
        classList={{"is-rich-activity": richMode()}}
        style={{"--status-content-size": contentSize()}}
      >
        <div class="status-content-layer status-content-layer--inline" aria-hidden={!richMode()}>
          <Show when={inlineActivity()}>
            {(activity) => (
              <div ref={captureInlinePanel} class="activity-inline" classList={{"activity-inline--listening": activity().activityType === 2}}>
                <ActivityDetails status={activity} active={richMode()}/>
              </div>
            )}
          </Show>
        </div>

        <div class="status-content-layer status-content-layer--compact" aria-hidden={richMode()} inert={richMode()}>
          <Show when={compactActivities().length > 0} fallback={<StatusFallback status={presence.status()}/>}>
            <div class="activity-signals">
              <Index each={compactActivities()}>
                {(activity) => <ActivitySignal status={activity} tooltipId={`activity-tooltip-${activity().activityId}`}/>}
              </Index>
            </div>
          </Show>
        </div>
      </div>
    </section>
  );
}

function StatusFallback(props: {status: PresenceStatus | null}) {
  if (!props.status) return <span class="status-loading">Tuning in<span class="loading-dots" aria-hidden="true">...</span></span>;
  if (props.status.type === "offline") return <span>Touching some grass <span aria-hidden="true">🌾</span></span>;
  return <span>Between adventures <span aria-hidden="true">☕</span></span>;
}
