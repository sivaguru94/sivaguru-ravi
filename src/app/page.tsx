export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
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
  );
}
