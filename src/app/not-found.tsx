import Link from "next/link";

/* 404 as a terminal screen — also literally accurate for unknown
 * /sivaguru-ravi/<cmd> deep links (dynamicParams=false lands here). */
export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        fontSize: 14,
        padding: 24,
        textAlign: "center",
      }}
    >
      <div style={{ color: "var(--dim)" }}>
        <span style={{ color: "var(--accent)", textShadow: "var(--glow)" }}>
          guest@shinigami-rog:~$
        </span>{" "}
        cd {"<requested-page>"}
      </div>
      <h1
        style={{
          fontSize: "clamp(28px, 6vw, 56px)",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          textTransform: "uppercase",
        }}
      >
        404: command not found
        <span
          aria-hidden="true"
          style={{
            color: "var(--accent)",
            textShadow: "var(--glow)",
            animation: "blink 1.2s infinite",
          }}
        >
          _
        </span>
      </h1>
      <p style={{ color: "var(--dim)" }}>
        the path you requested does not exist in this shell.
      </p>
      <Link
        href="/sivaguru-ravi"
        style={{
          marginTop: 20,
          display: "inline-block",
          border: "1px solid var(--line)",
          color: "var(--fg)",
          padding: "12px 20px",
          borderRadius: 4,
        }}
      >
        cd ~
      </Link>
    </main>
  );
}
