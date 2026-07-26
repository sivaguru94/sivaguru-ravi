import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div id="top">
      <Nav />
      {/* Sections land in M2 — placeholder keeps the page verifiably themed */}
      <main
        style={{
          minHeight: "96vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
        }}
      >
        <p>
          <span style={{ color: "var(--accent)", textShadow: "var(--glow)" }}>
            shinigami-rog
          </span>
          <span style={{ color: "var(--dim)" }}>:~$</span>{" "}
          <span aria-hidden="true" style={{ animation: "blink 1.2s infinite" }}>
            ▊
          </span>
        </p>
      </main>
      <Footer />
    </div>
  );
}
