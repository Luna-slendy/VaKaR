#!/usr/bin/env bash
set -euo pipefail

direction=${1:?Usage: sync-branch.sh to-azure|to-github}
: "${SOURCE_REF:?Missing SOURCE_REF}"

case "$SOURCE_REF" in
  refs/heads/*) source_branch=${SOURCE_REF#refs/heads/} ;;
  *) echo "Skip non-branch ref: $SOURCE_REF"; exit 0 ;;
esac
git check-ref-format "refs/heads/$source_branch"

case "$direction" in
  to-azure)
    target_url='https://dev.azure.com/Our0PiA/VaKaR/_git/VaKaR'
    case "$source_branch" in
      Vakar-Design) target_branch='feature/site-design' ;;
      Dmitrijs-Goncarovs) target_branch='feature/pipeline' ;;
      Stepan-hutorovs) target_branch='feature/database' ;;
      feature/site-design|feature/pipeline|feature/database)
        echo "Skip Azure branch name on GitHub; use its mapped GitHub branch."
        exit 0
        ;;
      *) target_branch=$source_branch ;;
    esac
    : "${AZURE_DEVOPS_PAT:?Missing AZURE_DEVOPS_PAT GitHub Actions secret}"
    auth=$(printf ':%s' "$AZURE_DEVOPS_PAT" | base64 -w0)
    echo "::add-mask::$auth"
    ;;
  to-github)
    target_url='https://github.com/Luna-slendy/VaKaR.git'
    case "$source_branch" in
      feature/site-design) target_branch='Vakar-Design' ;;
      feature/pipeline) target_branch='Dmitrijs-Goncarovs' ;;
      feature/database) target_branch='Stepan-hutorovs' ;;
      Vakar-Design|Dmitrijs-Goncarovs|Stepan-hutorovs)
        echo "Skip GitHub branch name on Azure; use its mapped Azure branch."
        exit 0
        ;;
      *) target_branch=$source_branch ;;
    esac
    if [[ -z ${GITHUB_PAT:-} || ${GITHUB_PAT:-} == '$(GITHUB_PAT)' ]]; then
      echo 'Set the secret GITHUB_PAT variable in Azure Pipelines.' >&2
      exit 1
    fi
    auth=$(printf 'x-access-token:%s' "$GITHUB_PAT" | base64 -w0)
    echo "##vso[task.setsecret]$auth"
    ;;
  *) echo "Unknown sync direction: $direction" >&2; exit 1 ;;
esac

# Keep credentials out of remote URLs, command-line arguments and repository config.
authenticated_git() {
  GIT_TERMINAL_PROMPT=0 \
  GIT_CONFIG_COUNT=1 \
  GIT_CONFIG_KEY_0="http.${target_url}.extraheader" \
  GIT_CONFIG_VALUE_0="Authorization: Basic $auth" \
    git "$@"
}

target_ref="refs/heads/$target_branch"
echo "Sync: $source_branch -> $target_branch ($direction)"

if authenticated_git ls-remote --exit-code "$target_url" "$target_ref" > /dev/null; then
  authenticated_git fetch --no-tags "$target_url" "$target_ref"

  # A round trip or an older queued run must not create a commit or rewind a branch.
  if git merge-base --is-ancestor HEAD FETCH_HEAD; then
    echo 'Already synchronized: the target contains this commit.'
    exit 0
  fi

  if ! git merge-base --is-ancestor FETCH_HEAD HEAD; then
    echo "Branches diverged: merge $source_branch with $target_branch before retrying sync." >&2
    exit 1
  fi
else
  lookup_status=$?
  # ls-remote returns 2 for a missing branch; authentication/network errors must fail.
  if [[ $lookup_status -ne 2 ]]; then
    exit "$lookup_status"
  fi
fi

# Normal pushes preserve history and reject conflicting concurrent updates.
authenticated_git push "$target_url" "HEAD:$target_ref"
