import {createSignal, onCleanup, onMount, Show} from "solid-js";
import {CheckIcon, CodeIcon} from "../ui/Icons";

type Notice = {id: number; message: string; unlocked: boolean};

export function DeveloperModeTrigger() {
  const [notice, setNotice] = createSignal<Notice>();
  let taps = 0;
  let unlocked = false;
  let resetTimer = 0;
  let noticeId = 0;

  const show = (message: string, isUnlocked = false) => {
    noticeId += 1;
    setNotice({id: noticeId, message, unlocked: isUnlocked});
  };

  const activate = () => {
    if (unlocked) {
      show("You are already a developer", true);
      return;
    }
    taps += 1;
    const remaining = 7 - taps;
    window.clearTimeout(resetTimer);
    resetTimer = window.setTimeout(() => { taps = 0; }, 4000);

    if (remaining === 0) {
      unlocked = true;
      window.clearTimeout(resetTimer);
      show("You are now a developer", true);
    } else if (remaining <= 4) {
      show(`You are ${remaining} ${remaining === 1 ? "step" : "steps"} away from being a developer`);
    }
  };

  onCleanup(() => window.clearTimeout(resetTimer));

  return (
    <>
      <footer class="site-footer">
        <button type="button" class="footer-developer-trigger" onClick={activate} data-ripple>
          <span class="footer-developer-copy">Made with curiosity, SolidJS, and an unreasonable number of rounded corners.</span>
        </button>
      </footer>
      <Show when={notice()} keyed>
        {(value) => <DeveloperToast notice={value} onDone={() => { if (notice()?.id === value.id) setNotice(); }}/>} 
      </Show>
    </>
  );
}

function DeveloperToast(props: {notice: Notice; onDone: () => void}) {
  const [leaving, setLeaving] = createSignal(false);
  let timer = 0;

  onMount(() => {
    timer = window.setTimeout(() => setLeaving(true), props.notice.unlocked ? 3200 : 1800);
  });
  onCleanup(() => window.clearTimeout(timer));

  return (
    <div
      class="developer-toast"
      classList={{"is-unlocked": props.notice.unlocked, "is-leaving": leaving()}}
      onAnimationEnd={(event) => {
        if (event.animationName === "developer-toast-exit") props.onDone();
      }}
      role="status"
      aria-live="polite"
    >
      <span class="developer-toast-icon" aria-hidden="true">{props.notice.unlocked ? <CheckIcon/> : <CodeIcon/>}</span>
      <strong>{props.notice.message}</strong>
    </div>
  );
}
