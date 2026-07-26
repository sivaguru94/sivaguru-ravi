import { commands } from "./commands";

/*
 * Completion engine — prototype semantics exactly:
 * - command position completes over the FULL registry (hidden commands
 *   included — `mat` + Tab discovering `matrix` is part of the trail)
 * - argument position completes from per-command sets
 * - ghost = first match's remainder
 * - Tab: unique → complete (+trailing space unless dir); ambiguous → extend
 *   to common prefix + return candidates for printing
 * - ↑/↓ with a prefix: cycle matches anchored to the typed base
 */

export type Candidates = {
  head: string;
  prefix: string;
  list: readonly string[];
};

export function argSets(): Record<string, readonly string[]> {
  return {
    cat: [
      ".secrets",
      "about.md",
      "ai/",
      "contact.txt",
      "experience.log",
      "me",
      "projects/",
      "resume.pdf",
      "skills/",
    ],
    cd: ["about", "ai", "contact", "projects", "skills", "work", "~"],
    open: ["resume.pdf"],
    man: Object.keys(commands).sort(),
  };
}

export function candidates(value: string): Candidates | null {
  const v = value.replace(/^\s+/, "");
  const parts = v.split(/\s+/);
  if (parts.length === 1 && !/\s$/.test(v)) {
    if (!parts[0]) return null;
    return {
      head: "",
      prefix: parts[0],
      list: Object.keys(commands).sort(),
    };
  }
  const sets = argSets()[parts[0].toLowerCase()];
  if (sets && parts.length <= 2)
    return { head: parts[0] + " ", prefix: parts[1] || "", list: sets };
  return null;
}

export function matchesFor(c: Candidates): string[] {
  return c.list.filter((x) => x.startsWith(c.prefix.toLowerCase()));
}

export function commonPrefix(matches: readonly string[]): string {
  let p = matches[0] ?? "";
  matches.forEach((m) => {
    while (!m.startsWith(p)) p = p.slice(0, -1);
  });
  return p;
}

export function ghost(value: string): string {
  const c = value ? candidates(value) : null;
  if (!c || !c.prefix) return "";
  const m = c.list.find(
    (x) =>
      x.startsWith(c.prefix.toLowerCase()) && x !== c.prefix.toLowerCase(),
  );
  return m ? m.slice(c.prefix.length) : "";
}

export type TabResult =
  | { kind: "none" }
  | { kind: "completed"; value: string }
  | { kind: "ambiguous"; value: string; candidates: string[] };

export function completeTab(value: string): TabResult {
  const c = candidates(value);
  if (!c) return { kind: "none" };
  const matches = matchesFor(c);
  if (matches.length === 1) {
    const m = matches[0];
    return {
      kind: "completed",
      value: c.head + m + (m.endsWith("/") ? "" : " "),
    };
  }
  if (matches.length > 1) {
    const p = commonPrefix(matches);
    return {
      kind: "ambiguous",
      value: p.length > c.prefix.length ? c.head + p : value,
      candidates: matches,
    };
  }
  return { kind: "none" };
}
