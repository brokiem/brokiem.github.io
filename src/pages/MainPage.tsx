import {ButtonLink} from "../components/Button";
import {useStore} from "@nanostores/solid";
import {$latestProject, $status} from "../store";
import {Show} from "solid-js";
import {Transition} from "solid-transition-group"

const MainPage = () => {
  function handleWindowResize() {
    const containerEl = document.getElementById("container");

    if (containerEl === null) return;

    // Center the container if the page is not scrollable
    if (document.documentElement.scrollHeight > window.innerHeight) {
      containerEl.classList.remove("justify-center", "items-center", "h-screen");
      containerEl.classList.add("mt-12");
    } else {
      containerEl.classList.remove("mt-12");
      containerEl.classList.add("justify-center", "items-center", "h-screen");
    }
  }

  window.addEventListener("resize", handleWindowResize);
  handleWindowResize();

  return (
    <>
      <div id="container" class={"max-w-4xl items-center justify-center h-screen"} flex={"~"} m={"x-auto"}>
        <div class={"slide-up"}>
          <div class={"overflow-hidden"} flex={"~ col"} content={"center"} gap={"5"} p={"x-4"}>
            <Header/>

            <div grid={"~ flow-row"} md={"grid-flow-col"} gap={"5"}>
              <AboutMe/>
              <LatestProject/>
            </div>

            <div flex={"~ row"} items={"center"} justify={"center"} w={"full"} gap={"5"}>
              <ButtonLink text={"Projects"} url={"/#/projects"}/>
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
                    switch (i) {
                      case "Spotify":
                        return <span>
                          Listening to Spotify
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" class="-top-px" fill={"white"}
                               w={"5"} h={"5"} m={"l-1"} inline relative>
                            <path
                              d="M248 8a248 248 0 1 0 0 496 248 248 0 0 0 0-496zm101 365c-5 0-7-1-11-4-62-37-135-39-207-24l-12 2c-9 0-15-7-15-15 0-11 6-16 13-17 82-18 166-17 237 26 6 4 10 7 10 16s-7 16-15 16zm27-66c-6 0-9-2-13-4-62-37-155-52-238-29l-12 2c-11 0-20-8-20-19s6-18 16-21c28-8 56-13 98-13 65 0 127 16 177 45 8 5 11 11 11 20 0 11-9 19-19 19zm31-76c-6 0-9-1-13-4-72-42-199-53-281-30-4 1-8 3-13 3-13 0-23-10-23-24 0-13 8-21 17-23 35-11 75-16 118-16 73 0 149 16 205 48 8 5 13 11 13 23 0 13-11 23-23 23z"/>
                          </svg>
                        </span>;
                      case "NoActivity":
                        return <span>
                          Not playing anything
                        </span>;
                      default:
                        return <span>
                          Playing {status()}
                          <svg width={"26"} height={"26"} viewBox="0 0 16 16" fill={"white"} inline relative>
                            <path fill="currentColor"
                                  d="M6,7 L2,7 L2,6 L6,6 L6,7 Z M8,5 L2,5 L2,4 L8,4 L8,5 Z M8,3 L2,3 L2,2 L8,2 L8,3 Z M8.88888889,0 L1.11111111,0 C0.494444444,0 0,0.494444444 0,1.11111111 L0,8.88888889 C0,9.50253861 0.497461389,10 1.11111111,10 L8.88888889,10 C9.50253861,10 10,9.50253861 10,8.88888889 L10,1.11111111 C10,0.494444444 9.5,0 8.88888889,0 Z"
                                  transform="translate(3 3)"></path>
                          </svg>
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

const AboutMe = () => {
  return (
    <>
      <div bg={"#271d1a"} rounded={"3xl"} p={"5"}>
        <h1 class={"leading-none"} font={"extrabold"} text={"3xl"} m={"0"}>Hello there!</h1>
        <p class={"leading-normal"} m={"0 t-2"}>I'm a developer from Indonesia who loves to code and learn new stuff. Right now I'm mostly into web development, but I also enjoy messing around with Flutter to make desktop apps. Feel free to check my collection of projects! <br/><br/> When I'm not staring at code, I'll probably be sweating it out in VALORANT, exploring the world of Genshin Impact, failing miserably at osu!, or just building random stuff in Minecraft.
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
