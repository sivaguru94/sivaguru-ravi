import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { Hero } from "./sections/Hero";
import { About } from "./sections/About";
import { Work } from "./sections/Work";
import { Skills } from "./sections/Skills";
import { AiLeadership } from "./sections/AiLeadership";
import { Projects } from "./sections/Projects";
import { Contact } from "./sections/Contact";
import { ShellProvider } from "./shell/ShellProvider";

/* The complete single page — shared by `/` and the /sivaguru-ravi/<cmd>
 * deep-link routes. Server component; the shell loads on demand. */
export function Portfolio() {
  return (
    <div id="top">
      <Nav />
      <Hero />
      <About />
      <Work />
      <Skills />
      <AiLeadership />
      <Projects />
      <Contact />
      <Footer />
      <ShellProvider />
    </div>
  );
}
