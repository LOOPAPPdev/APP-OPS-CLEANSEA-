#!/usr/bin/env python3
"""Non-overwriting importer for the official Cloudflare React Router + Hono starter.

Usage:
    python3 scripts/import_scaffold.py --dry-run
    python3 scripts/import_scaffold.py --apply

Test with a local checkout (no network):
    python3 scripts/import_scaffold.py --dry-run --source /path/to/template
"""
from __future__ import annotations

import argparse
import datetime as dt
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

SOURCE_URL = "https://github.com/cloudflare/react-router-hono-fullstack-template.git"
SKIP_ROOT = {".git", "README.md", "CLAUDE.md", ".gitignore", "docs", "scripts", ".github"}
PROVENANCE = Path("docs/architecture/SCAFFOLD-PROVENANCE.md")


def run(*args: str, cwd: Path | None = None) -> str:
    result = subprocess.run(list(args), cwd=cwd, check=True, text=True,
                            stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    return result.stdout.strip()


def files_to_import(source: Path) -> list[Path]:
    found: list[Path] = []
    for path in source.rglob("*"):
        rel = path.relative_to(source)
        if rel.parts[0] in SKIP_ROOT:
            continue
        if path.is_symlink():
            raise RuntimeError(f"Refusing symlink in scaffold: {rel}")
        if path.is_file():
            found.append(rel)
    return sorted(found, key=lambda p: p.as_posix())


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    action = parser.add_mutually_exclusive_group(required=True)
    action.add_argument("--dry-run", action="store_true", help="Inspect only. Does not change repo.")
    action.add_argument("--apply", action="store_true", help="Copy approved template files safely.")
    parser.add_argument("--source", type=Path, help="Use a local source directory instead of cloning GitHub (testing).")
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]

    try:
        git_root = Path(run("git", "rev-parse", "--show-toplevel", cwd=root)).resolve()
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("ERROR: initialize or clone the GitHub repository before importing.", file=sys.stderr)
        return 2
    if git_root != root:
        print("ERROR: script must run inside the root of its own Git repository.", file=sys.stderr)
        return 2
    status = run("git", "status", "--porcelain", cwd=root)
    if status:
        print("BLOCKED: Git working tree is not clean. Commit governance files first.")
        print(status[:3000])
        return 2

    with tempfile.TemporaryDirectory(prefix="bpms-cloudflare-") as tmp:
        if args.source is not None:
            source = args.source.resolve()
            if not source.is_dir():
                print(f"ERROR: source not found: {source}", file=sys.stderr)
                return 2
            source_name = str(source)
        else:
            source = Path(tmp) / "upstream"
            print("Fetching official source read-only (no changes to your repo)...")
            try:
                run("git", "clone", "--depth", "1", SOURCE_URL, str(source))
            except (subprocess.CalledProcessError, FileNotFoundError) as ex:
                print(f"ERROR: could not clone official template: {ex}", file=sys.stderr)
                return 2
            source_name = SOURCE_URL
        for required in ("package.json", "app", "workers", "wrangler.jsonc"):
            if not (source / required).exists():
                print(f"ERROR: source missing expected template path: {required}", file=sys.stderr)
                return 2
        try:
            planned = files_to_import(source)
        except RuntimeError as ex:
            print(f"ERROR: {ex}", file=sys.stderr)
            return 2

        collisions = [p for p in planned if (root / p).exists() or (root / p).is_symlink()]
        provenance_collision = (root / PROVENANCE).exists()
        try:
            commit = run("git", "rev-parse", "HEAD", cwd=source)
        except (subprocess.CalledProcessError, FileNotFoundError):
            commit = "UNVERSIONED-LOCAL-FIXTURE"

        print(f"SOURCE: {source_name}")
        print(f"SOURCE COMMIT: {commit}")
        print(f"FILES TO COPY: {len(planned)}")
        print("SAMPLE PATHS:")
        for path in planned[:12]:
            print(f"  + {path.as_posix()}")
        if collisions or provenance_collision:
            print("BLOCKED: existing destination files found. No changes made.")
            for path in collisions[:30]:
                print(f"  ! {path.as_posix()}")
            if provenance_collision:
                print(f"  ! {PROVENANCE}")
            return 2

        if args.dry_run:
            print("DRY RUN PASS: zero destination writes; rerun with --apply after review.")
            return 0

        created_files: list[Path] = []
        created_dirs: list[Path] = []
        try:
            for rel in planned:
                target = root / rel
                target_parent = target.parent
                missing: list[Path] = []
                walk = target_parent
                while not walk.exists():
                    missing.append(walk)
                    walk = walk.parent
                for folder in reversed(missing):
                    folder.mkdir()
                    created_dirs.append(folder)
                # use exclusive creation for an additional collision guard
                with (source / rel).open("rb") as src, target.open("xb") as dst:
                    created_files.append(target)
                    shutil.copyfileobj(src, dst)
            metadata = (
                "# Scaffold provenance (generated)\n\n"
                f"- Imported at UTC: {dt.datetime.now(dt.timezone.utc).isoformat(timespec='seconds')}\n"
                f"- Upstream source: {source_name}\n"
                f"- Upstream commit: `{commit}`\n"
                f"- Imported files: {len(planned)}\n"
                "- Upstream README and .gitignore: deliberately not imported; inspect separately.\n"
                "- License status: **NOT VERIFIED**; review upstream and dependencies before commercial release.\n"
                "- Post-import required checks: `npm ci`, `npm run typecheck`, `npm run build`.\n"
            )
            with (root / PROVENANCE).open("x", encoding="utf-8") as file:
                created_files.append(root / PROVENANCE)
                file.write(metadata)
        except Exception as ex:
            for file in reversed(created_files):
                file.unlink(missing_ok=True)
            for folder in reversed(created_dirs):
                try:
                    folder.rmdir()
                except OSError:
                    pass
            print(f"ERROR: import failed and new files were rolled back: {ex}", file=sys.stderr)
            return 2

        print("APPLY PASS: scaffold files copied without overwriting existing files.")
        print("NEXT: review git diff/status, then npm ci, npm run typecheck, npm run build.")
        print("NO cloud resource was provisioned and NO deployment was executed.")
        return 0


if __name__ == "__main__":
    raise SystemExit(main())
