import {AboutCard} from "../components/about/AboutCard";
import {DeveloperModeTrigger} from "../components/feedback/DeveloperModeTrigger";
import {SecretDiscovery} from "../components/feedback/SecretDiscovery";
import {HeroCard} from "../components/hero/HeroCard";
import {PortraitCard} from "../components/hero/PortraitCard";
import {WorkbenchSection} from "../components/playground/WorkbenchSection";
import {StatusCard} from "../components/presence/StatusCard";
import {FeaturedProject} from "../components/projects/FeaturedProject";

export default function HomePage() {
  return (
    <main class="home-page">
      <div class="home-grid">
        <HeroCard/>
        <PortraitCard/>
        <StatusCard/>
        <AboutCard/>
        <FeaturedProject/>
      </div>
      <WorkbenchSection/>
      <DeveloperModeTrigger/>
      <SecretDiscovery/>
    </main>
  );
}
