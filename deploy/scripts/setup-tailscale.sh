#!/usr/bin/env bash
# Joins the VM to the tailnet with Tailscale SSH enabled, so admin access
# works from any tailnet device with no public SSH exposure needed.
# Usage: sudo bash setup-tailscale.sh
set -euo pipefail
[ "$(id -u)" -eq 0 ] || { echo "run with sudo"; exit 1; }

command -v tailscale >/dev/null 2>&1 || curl -fsSL https://tailscale.com/install.sh | sh

# prints an auth URL — open it in a browser and approve
tailscale up --ssh --hostname=oci-shinigami

echo
echo "node joined as 'oci-shinigami'. From any tailnet device:"
echo "  ssh ubuntu@oci-shinigami      (Tailscale SSH — no keys needed)"
echo
echo "optional, after confirming tailnet ssh works: close public 22 in the"
echo "OCI security list (CI deploys still use public 22 from GitHub runners"
echo "— keep it open unless you switch CD to a tailscale auth key)."
