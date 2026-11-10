"""Exercise the real sync script against local repositories; network is disabled."""

import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest


SCRIPT = Path(__file__).resolve().with_name("sync-branch.sh")
URLS = {
    "azure": "https://dev.azure.com/Our0PiA/VaKaR/_git/VaKaR",
    "github": "https://github.com/Luna-slendy/VaKaR.git",
}
MAPPINGS = {
    "Vakar-Design": "feature/site-design",
    "Dmitrijs-Goncarovs": "feature/pipeline",
    "Stepan-hutorovs": "feature/database",
}


def find_bash():
    if os.name == "nt":
        git = shutil.which("git")
        if git:
            bundled = Path(git).resolve().parent.parent / "bin" / "bash.exe"
            if bundled.exists():
                return str(bundled)
    return shutil.which("bash")


class SyncBranchTests(unittest.TestCase):
    def setUp(self):
        self.bash = find_bash()
        if not self.bash:
            self.skipTest("Bash is required")
        self.temporary = tempfile.TemporaryDirectory(prefix="vakar sync test ")
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        self.repo = self.root / "source"
        self.repo.mkdir()
        self.env = {key: value for key, value in os.environ.items()
                    if not key.startswith("GIT_")}
        self.env.update(GIT_CONFIG_GLOBAL=os.devnull, GIT_CONFIG_NOSYSTEM="1")
        self.git("init", "-q", "--initial-branch=main")
        self.git("config", "user.name", "Sync Test")
        self.git("config", "user.email", "sync-test@example.invalid")
        self.git("config", "core.autocrlf", "false")
        self.git("config", "protocol.allow", "never")
        self.git("config", "protocol.file.allow", "always")
        self.remotes = {}
        for name, url in URLS.items():
            remote = self.root / f"{name}.git"
            self.git("init", "-q", "--bare", str(remote))
            self.git("config", f"url.{remote.as_posix()}.insteadOf", url)
            self.remotes[name] = remote
        self.base = self.commit("initial")

    def git(self, *args):
        result = subprocess.run(["git", *args], cwd=self.repo, env=self.env,
                                text=True, capture_output=True, check=True)
        return result.stdout.strip()

    def commit(self, content):
        (self.repo / "example.txt").write_text(content, encoding="utf-8")
        self.git("add", "example.txt")
        self.git("commit", "-q", "-m", content)
        return self.git("rev-parse", "HEAD")

    def tip(self, remote, branch):
        return self.git("--git-dir", str(self.remotes[remote]),
                        "rev-parse", f"refs/heads/{branch}")

    def seed(self, remote, branch="main"):
        self.git("push", str(self.remotes[remote]), f"HEAD:refs/heads/{branch}")

    def sync(self, direction, branch="main", secrets=True, source_ref=None,
             github_pat="test-github-token"):
        env = self.env.copy()
        env.pop("AZURE_DEVOPS_PAT", None)
        env.pop("GITHUB_PAT", None)
        env["SOURCE_REF"] = source_ref or f"refs/heads/{branch}"
        if secrets:
            env.update(AZURE_DEVOPS_PAT="test-azure-token", GITHUB_PAT=github_pat)
        return subprocess.run([self.bash, SCRIPT.as_posix(), direction],
                              cwd=self.repo, env=env, text=True,
                              capture_output=True, timeout=30)

    def assert_success(self, result):
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_changes_travel_both_ways_and_round_trip_is_a_noop(self):
        self.seed("github")
        self.assert_success(self.sync("to-azure"))
        self.assertEqual(self.tip("azure", "main"), self.base)
        azure_change = self.commit("change made on Azure")
        self.seed("azure")
        self.assert_success(self.sync("to-github"))
        self.assertEqual(self.tip("github", "main"), azure_change)
        round_trip = self.sync("to-azure")
        self.assert_success(round_trip)
        self.assertIn("Already synchronized", round_trip.stdout)
        self.assertEqual(self.tip("azure", "main"), azure_change)

    def test_all_special_branch_pairs_work_in_both_directions(self):
        for github_branch, azure_branch in MAPPINGS.items():
            with self.subTest(github=github_branch):
                self.assert_success(self.sync("to-azure", github_branch))
                self.assertEqual(self.tip("azure", azure_branch), self.base)
                self.assert_success(self.sync("to-github", azure_branch))
                self.assertEqual(self.tip("github", github_branch), self.base)

    def test_other_branch_names_with_slashes_are_preserved(self):
        for direction, remote in (("to-azure", "azure"), ("to-github", "github")):
            with self.subTest(direction=direction):
                self.assert_success(self.sync(direction, "feature/auth"))
                self.assertEqual(self.tip(remote, "feature/auth"), self.base)

    def test_older_run_does_not_rewind_newer_target(self):
        newer = self.commit("newer target")
        self.seed("github")
        self.git("checkout", "-q", "--detach", self.base)
        result = self.sync("to-github")
        self.assert_success(result)
        self.assertIn("Already synchronized", result.stdout)
        self.assertEqual(self.tip("github", "main"), newer)

    def test_divergent_changes_fail_without_overwriting_target(self):
        target_tip = self.commit("target change")
        self.seed("azure")
        self.git("checkout", "-q", "--detach", self.base)
        self.commit("independent source change")
        result = self.sync("to-azure")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Branches diverged", result.stderr)
        self.assertEqual(self.tip("azure", "main"), target_tip)

    def test_aliases_on_wrong_side_are_skipped_without_credentials(self):
        for github_branch, azure_branch in MAPPINGS.items():
            for direction, branch in (("to-azure", azure_branch),
                                      ("to-github", github_branch)):
                with self.subTest(direction=direction, branch=branch):
                    result = self.sync(direction, branch, secrets=False)
                    self.assert_success(result)
                    self.assertIn("Skip", result.stdout)

    def test_nonbranch_refs_do_not_sync(self):
        for source_ref in ("refs/pull/1/merge", "refs/tags/v1"):
            with self.subTest(ref=source_ref):
                result = self.sync("to-github", source_ref=source_ref, secrets=False)
                self.assert_success(result)
                self.assertIn("Skip non-branch ref", result.stdout)

    def test_missing_credentials_fail_with_setup_message(self):
        for direction, name in (("to-azure", "AZURE_DEVOPS_PAT"),
                                ("to-github", "GITHUB_PAT")):
            with self.subTest(direction=direction):
                result = self.sync(direction, secrets=False)
                self.assertNotEqual(result.returncode, 0)
                self.assertIn(name, result.stderr)
        result = self.sync("to-github", github_pat="$(GITHUB_PAT)")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Set the secret GITHUB_PAT", result.stderr)

    def test_unreachable_remote_is_not_treated_as_missing_branch(self):
        self.git("config", "--unset-all",
                 f"url.{self.remotes['azure'].as_posix()}.insteadOf")
        missing = self.root / "missing.git"
        self.git("config", f"url.{missing.as_posix()}.insteadOf", URLS["azure"])
        result = self.sync("to-azure")
        self.assertNotEqual(result.returncode, 0)
        self.assertNotIn("Already synchronized", result.stdout)


if __name__ == "__main__":
    unittest.main(verbosity=2)
