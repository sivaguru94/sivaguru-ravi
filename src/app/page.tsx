import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Work } from "@/components/sections/Work";
import { Skills } from "@/components/sections/Skills";
import { AiLeadership } from "@/components/sections/AiLeadership";
import { Projects } from "@/components/sections/Projects";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
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
    </div>
  );
}
