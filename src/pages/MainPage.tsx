import {ButtonLink} from "../components/Button";
import {useStore} from "@nanostores/solid";
import {$latestProject, $status, ActivityStatus} from "../store";
import {createMemo, createSignal, onCleanup, Show} from "solid-js";
import {Transition} from "solid-transition-group"

const MainPage = () => {
  return (
    <>
      <div id="container" class={"max-w-4xl min-h-screen items-center justify-center py-12"} flex={"~"} m={"x-auto"}>
        <div class={"slide-up"}>
          <div class={"overflow-visible"} flex={"~ col"} content={"center"} gap={"5"} p={"x-4"}>
            <Header/>

            <div grid={"~ flow-row"} md={"grid-flow-col"} gap={"5"}>
              <AboutMe/>
              <LatestProject/>
            </div>

            <div flex={"~ row"} items={"center"} justify={"center"} w={"full"} gap={"5"}>
              <ButtonLink text={"Projects"} url={"/projects"}/>
              <ButtonLink text={"GitHub"} url={"https://github.com/brokiem"}/>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const Header = () => {
  const status = useStore($status);

  return (
    <>
      <div
        flex={"~"}
        justify={"between"}
        rounded={"3xl"}
        bg={"#271d1a"}
        w={"full"}
      >
        <div flex={"~"} items={"center"} p={"y-5"} m={"x-auto"} gap={"4"}>
          <img
            id={"profile-picture"}
            src={"/brokiem.webp"}
            width={"100"}
            height={"100"}
            rounded={"full"}
            alt={"profile-picture"}/>

          <div flex={"~ col"} gap={"1"}>
            <span id={"name"} leading={"none"} font={"extrabold"} text={"2em"}>brokiem</span>
            <span id={"status"}>
              <Transition mode="outin" name="slide-fade">
                <Show when={status()} fallback={<div>Loading activity<span class="dot dot-1">.</span><span
                  class="dot dot-2">.</span><span class="dot dot-3">.</span></div>} keyed>
                  {i => {
                    switch (i.type) {
                      case "activity":
                        return <span class={"status-popover-trigger group"} tabIndex={0} aria-describedby={"activity-tooltip"}>
                          {i.text}
                          <StatusIcon status={i}/>
                          <ActivityTooltip status={i}/>
                        </span>;
                      case "none":
                        return <span>
                          Not playing anything ☕
                        </span>;
                      case "offline":
                        return <span>
                          Touching some grass 🌾...
                        </span>;
                    }
                  }}
                  </Show>
                </Transition>
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

const StatusIcon = ({status}: { status: ActivityStatus }) => {
  if (status.activityType === 2 && status.text === "Listening to Spotify") {
    return (
      <SpotifyIcon/>
    );
  }

  if (status.activityType === 4) return null;

  return (
    <svg width={"26"} height={"26"} viewBox="0 0 16 16" fill={"white"} inline relative>
      <path fill="currentColor"
            d="M6,7 L2,7 L2,6 L6,6 L6,7 Z M8,5 L2,5 L2,4 L8,4 L8,5 Z M8,3 L2,3 L2,2 L8,2 L8,3 Z M8.88888889,0 L1.11111111,0 C0.494444444,0 0,0.494444444 0,1.11111111 L0,8.88888889 C0,9.50253861 0.497461389,10 1.11111111,10 L8.88888889,10 C9.50253861,10 10,9.50253861 10,8.88888889 L10,1.11111111 C10,0.494444444 9.5,0 8.88888889,0 Z"
            transform="translate(3 3)"></path>
    </svg>
  );
};

const ActivityTooltip = ({status}: { status: ActivityStatus }) => {
  return (
    <span id={"activity-tooltip"} class={"activity-tooltip"} role={"tooltip"}>
      <span class={"activity-tooltip-content"}>
        <Show when={status.tooltip.visual} keyed>
          {(visual) => <ActivityArtwork visual={visual}/>}
        </Show>
        <span class={"activity-tooltip-copy"}>
          <span class={"activity-tooltip-title"}>{status.tooltip.title}</span>
          {status.tooltip.lines.map((line) => (
            <span class={"activity-tooltip-line"}>{line}</span>
          ))}
          <Show when={status.tooltip.progress} keyed>
            {(progress) => <ActivityProgress progress={progress}/>}
          </Show>
        </span>
      </span>
      <Show when={status.tooltip.otherActivitiesCount > 0}>
        <span class={"activity-other-list"}>
          {status.tooltip.otherActivities.map((activity) => (
            <span class={"activity-other-item"}>
              <Show when={activity.visual} keyed fallback={<span class={"activity-other-placeholder"}/>}>
                {(visual) => <ActivityMiniArtwork visual={visual}/>}
              </Show>
              <span class={"activity-other-copy"}>
                <span class={"activity-other-title"}>{activity.title}</span>
                <span class={"activity-other-detail"}>
                  {activity.eyebrow}{activity.detail ? ` - ${activity.detail}` : ""}
                </span>
              </span>
            </span>
          ))}
        </span>
      </Show>
    </span>
  );
};

const ActivityArtwork = ({visual}: { visual: NonNullable<ActivityStatus["tooltip"]["visual"]> }) => {
  return (
    <span class={"activity-artwork"} aria-hidden={"true"}>
      <Show when={visual.thumbnailUrl}
            keyed
            fallback={<span class={"activity-artwork-empty"}>{visual.iconKind === "spotify" ? <SpotifyIcon inline={false}/> : null}</span>}>
        {(thumbnailUrl) => (
          <img
            class={"activity-artwork-image"}
            src={thumbnailUrl}
            alt={visual.thumbnailAlt}
            width={"56"}
            height={"56"}
            loading={"lazy"}
            decoding={"async"}
          />
        )}
      </Show>

      <Show when={visual.iconUrl || visual.iconKind}>
        <span class={"activity-app-icon"}>
          <Show when={visual.iconUrl} keyed fallback={<SpotifyIcon inline={false}/>}>
            {(iconUrl) => (
              <img
                src={iconUrl}
                alt={visual.iconAlt}
                width={"20"}
                height={"20"}
                loading={"lazy"}
                decoding={"async"}
              />
            )}
          </Show>
        </span>
      </Show>
    </span>
  );
};

const ActivityMiniArtwork = ({visual}: { visual: NonNullable<ActivityStatus["tooltip"]["visual"]> }) => {
  return (
    <span class={"activity-other-artwork"} aria-hidden={"true"}>
      <Show when={visual.thumbnailUrl || visual.iconUrl} keyed fallback={visual.iconKind === "spotify" ? <SpotifyIcon inline={false}/> : null}>
        {(imageUrl) => (
          <img
            src={imageUrl}
            alt={visual.thumbnailUrl ? visual.thumbnailAlt : visual.iconAlt}
            width={"24"}
            height={"24"}
            loading={"lazy"}
            decoding={"async"}
          />
        )}
      </Show>
    </span>
  );
};

const ActivityProgress = ({progress}: { progress: NonNullable<ActivityStatus["tooltip"]["progress"]> }) => {
  const [now, setNow] = createSignal(Date.now());
  const timer = window.setInterval(() => setNow(Date.now()), 1000);
  onCleanup(() => window.clearInterval(timer));

  const progressInfo = createMemo(() => {
    if (progress.start && progress.end) {
      const duration = Math.max(progress.end - progress.start, 1);
      const elapsed = Math.min(Math.max(now() - progress.start, 0), duration);

      return {
        label: `${formatDuration(elapsed)} / ${formatDuration(duration)}`,
        value: `${(elapsed / duration) * 100}%`,
        hasBar: true,
      };
    }

    if (progress.start) {
      return {
        label: `${formatDuration(Math.max(now() - progress.start, 0))} elapsed`,
        value: "0%",
        hasBar: false,
      };
    }

    if (progress.end) {
      return {
        label: `${formatDuration(Math.max(progress.end - now(), 0))} remaining`,
        value: "100%",
        hasBar: false,
      };
    }

    return null;
  });

  return (
    <Show when={progressInfo()}>
      {(info) => (
        <span class={"activity-progress"}>
          <span class={"activity-progress-time"}>{info().label}</span>
          <Show when={info().hasBar}>
            <span class={"activity-progress-track"} aria-hidden={"true"}>
              <span class={"activity-progress-fill"} style={{width: info().value}}/>
            </span>
          </Show>
        </span>
      )}
    </Show>
  );
};

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

const SpotifyIcon = ({inline = true}: { inline?: boolean }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" class="-top-px" fill={"white"}
         w={"5"} h={"5"} m={inline ? "l-1" : undefined} inline relative>
      <path
        d="M248 8a248 248 0 1 0 0 496 248 248 0 0 0 0-496zm101 365c-5 0-7-1-11-4-62-37-135-39-207-24l-12 2c-9 0-15-7-15-15 0-11 6-16 13-17 82-18 166-17 237 26 6 4 10 7 10 16s-7 16-15 16zm27-66c-6 0-9-2-13-4-62-37-155-52-238-29l-12 2c-11 0-20-8-20-19s6-18 16-21c28-8 56-13 98-13 65 0 127 16 177 45 8 5 11 11 11 20 0 11-9 19-19 19zm31-76c-6 0-9-1-13-4-72-42-199-53-281-30-4 1-8 3-13 3-13 0-23-10-23-24 0-13 8-21 17-23 35-11 75-16 118-16 73 0 149 16 205 48 8 5 13 11 13 23 0 13-11 23-23 23z"/>
    </svg>
  );
};

const AboutMe = () => {
  return (
    <>
      <div bg={"#271d1a"} rounded={"3xl"} p={"5"}>
        <h1 class={"leading-none"} font={"extrabold"} text={"3xl"} m={"0"}>Hello there!</h1>
        <p class={"leading-normal"} m={"0 t-2"}>
          I turn curious little ideas into games, tools, and web things that are useful, playful, or both on a good day. Mostly web right now. Sometimes desktop apps. Occasionally a game. Always whatever looked interesting enough to lose an evening to.
          <br/><br/>
          Away from code, I’m probably queueing VALORANT, missing notes in osu!, watching movies and tv shows, or remembering that grass exists.
        </p>
      </div>
    </>
  )
};

const LatestProject = () => {
  const latestProject = useStore($latestProject);

  return (
    <>
      <div flex={"~ col"} justify={"center"} bg={"#271d1a"} rounded={"3xl"} p={"5"} gap={"3"}>
        <h1 leading={"none"} font={"extrabold"} text={"2xl"} m={"0 r-4"}>Latest Project</h1>

        <Transition mode="outin" name="slide-fade">
          <Show when={latestProject()} keyed>
            {
              i => <a
                href={i.url}
                class={"hover:underline"}
                text={"white"}
                m={"0"}
                leading={"none"}
                no-underline>
                {i.name}
              </a>
            }
          </Show>
        </Transition>
      </div>
    </>
  )
};

export default MainPage;
