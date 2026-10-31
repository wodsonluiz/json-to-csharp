#!/usr/bin/env bash
set -euo pipefail
archive="$RUNNER_TEMP/gitleaks.tar.gz"
curl --fail --silent --show-error --location --retry 3 \
  https://github.com/gitleaks/gitleaks/releases/download/v8.30.1/gitleaks_8.30.1_linux_x64.tar.gz \
  --output "$archive"
printf '%s  %s\n' '551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb' "$archive" | sha256sum --check --strict
mkdir -p "$RUNNER_TEMP/security-tools" "$RUNNER_TEMP/scan-source"
tar -xzf "$archive" -C "$RUNNER_TEMP/security-tools" gitleaks
echo "$RUNNER_TEMP/security-tools" >> "$GITHUB_PATH"
