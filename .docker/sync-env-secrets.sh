#!/usr/bin/env bash
# Create a GitHub *environment* and push its secrets from a .docker/.env.<env> file,
# so deploy-application.yaml can read them via `secrets: inherit`.
#
# Mirrors the dev/prod setup: each environment is pinned to one deployment branch
# (htm-dev -> hoa-theo-mua-dev, htm-prod -> hoa-theo-mua-prod, dev -> dev, prod -> main) and gets one secret per
# KEY=VALUE line in its env file (REGISTRY/TAG are skipped — CI computes those).
#
# NOTE: each environment name (for example htm-dev or htm-prod) must match the compose profile used in
# build-image.yaml / deploy-application.yaml, NOT the deployment branch name — the
# branch is only used for the deployment-branch-policy restriction below.
#
# Requirements: gh CLI authed with repo admin (`gh auth login`), run from repo root.
#
# Usage:
#   ./.docker/sync-env-secrets.sh                          # htm-dev from .docker/.env.htm-dev
#   ENVIRONMENTS="dev prod htm-prod" ./.docker/sync-env-secrets.sh
#   REPO=Owner/repo ./.docker/sync-env-secrets.sh
#   ENV_FILE=.docker/.env.htm-dev ENVIRONMENTS="htm-dev" ./.docker/sync-env-secrets.sh
#   ENV_FILE=.docker/.env.htm-prod ENVIRONMENTS="htm-prod" ./.docker/sync-env-secrets.sh
set -euo pipefail

REPO="${REPO:-TaskCoper/taskcoper-fe}"
ENVIRONMENTS="${ENVIRONMENTS:-htm-dev}"
DIR="$(cd "$(dirname "$0")" && pwd)"

# Keys present in the env file that should NOT become secrets (computed in CI).
EXCLUDE='^(REGISTRY|TAG)='

# Which deployment branch each environment is restricted to (empty => allow all).
branch_for_env() {
  case "$1" in
    htm-dev)  echo "hoa-theo-mua-dev" ;;
    htm-prod) echo "hoa-theo-mua-prod" ;;
    dev)      echo "dev" ;;
    prod)     echo "main" ;;
    *)        echo "" ;;
  esac
}

command -v gh >/dev/null || { echo "gh CLI not found — install it and run 'gh auth login'." >&2; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "gh not authenticated — run 'gh auth login'." >&2; exit 1; }

for ENV in $ENVIRONMENTS; do
  # Require an explicit per-environment file so production cannot inherit another environment by accident.
  FILE="${ENV_FILE:-$DIR/.env.$ENV}"
  [ -f "$FILE" ] || { echo "env file not found for '$ENV': $FILE" >&2; exit 1; }

  BRANCH="$(branch_for_env "$ENV")"

  echo ">> Ensuring environment '$ENV' exists..."
  if [ -n "$BRANCH" ]; then
    # Enable custom branch policies so we can pin the environment to one branch.
    gh api -X PUT "repos/$REPO/environments/$ENV" --input - >/dev/null <<JSON
{"deployment_branch_policy":{"protected_branches":false,"custom_branch_policies":true}}
JSON
    # Keep exactly one branch rule. This also repairs stale or previously incorrect policies.
    branch_exists=false
    while IFS=$'\t' read -r POLICY_ID POLICY_NAME; do
      [ -n "$POLICY_ID" ] || continue
      if [ "$POLICY_NAME" = "$BRANCH" ]; then
        branch_exists=true
      else
        echo "   - removing stale branch restriction '$POLICY_NAME'"
        gh api -X DELETE "repos/$REPO/environments/$ENV/deployment-branch-policies/$POLICY_ID" >/dev/null
      fi
    done < <(gh api "repos/$REPO/environments/$ENV/deployment-branch-policies" \
      --jq '.branch_policies[] | [.id, .name] | @tsv' 2>/dev/null || true)

    if [ "$branch_exists" != true ]; then
      echo "   + restricting deployments to branch '$BRANCH'"
      gh api -X POST "repos/$REPO/environments/$ENV/deployment-branch-policies" -f name="$BRANCH" >/dev/null
    fi
  else
    gh api -X PUT "repos/$REPO/environments/$ENV" >/dev/null
  fi

  echo ">> Setting secrets for '$ENV' from $FILE ..."
  gh secret set \
    --repo "$REPO" \
    --env "$ENV" \
    --env-file <(grep -vE '^[[:space:]]*#' "$FILE" | grep '=' | grep -vE "$EXCLUDE")

  echo ">> Done '$ENV'. ($(gh secret list --repo "$REPO" --env "$ENV" | wc -l | tr -d ' ') secrets)"
done

echo "All set. Verify each environment with: gh secret list --repo $REPO --env <environment>"

# ENVIRONMENTS="htm-dev" ENV_FILE=.docker/.env.htm-dev ./.docker/sync-env-secrets.sh
# ENVIRONMENTS="htm-prod" ENV_FILE=.docker/.env.htm-prod ./.docker/sync-env-secrets.sh
