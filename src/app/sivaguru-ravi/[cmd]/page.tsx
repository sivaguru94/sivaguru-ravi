import type { Metadata } from "next";
import { Portfolio } from "@/components/Portfolio";
import { DeepLinkRunner } from "@/components/shell/DeepLinkRunner";
import { commands } from "@/core/terminal/commands";

/*
 * Command deep links: shinigami-rog.cc/sivaguru-ravi/<command> renders the
 * site, opens the shell, and runs the command (plan §5). Fixed allowlist =
 * the registry (minus settings commands); anything else 404s to the
 * `command not found` page. Never indexed; canonical stays `/`.
 */

const EXCLUDED = new Set(["motion", "scanlines"]);

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(commands)
    .filter((cmd) => !EXCLUDED.has(cmd))
    .map((cmd) => ({ cmd }));
}

export const metadata: Metadata = {
  robots: { index: false },
  alternates: { canonical: "/sivaguru-ravi" },
};

export default async function CommandPage({
  params,
}: {
  params: Promise<{ cmd: string }>;
}) {
  const { cmd } = await params;
  return (
    <>
      <Portfolio />
      <DeepLinkRunner cmd={cmd} />
    </>
  );
}
