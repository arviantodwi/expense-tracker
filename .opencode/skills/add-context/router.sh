#!/usr/bin/env bash
#############################################################################
# Add Context Skill Router
# Routes to add-context-cli.ts with proper path resolution and command handling
#############################################################################

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLI_SCRIPT="$SCRIPT_DIR/scripts/add-context-cli.ts"

# Show help
show_help() {
  cat << 'HELP'
📋 Add Context Skill
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Interactive wizard for creating project intelligence context files.

USAGE:
  ./router.sh [OPTIONS]

OPTIONS:
  --update              Update existing context with review prompts
  --tech-stack          Quick update of tech stack only
  --patterns            Quick update of code patterns only
  --global              Save to ~/.config/opencode/context/ instead of project
  --help, -h, --h      Show this help message

DESCRIPTION:
  Interactive 6-question wizard that creates technical-domain.md following
  Project Intelligence + MVI + frontmatter standards.

  Questions:
    1. Tech stack (framework, language, database, styling)
    2. API endpoint example
    3. Component example
    4. Naming conventions
    5. Code standards
    6. Security requirements

  Creates:
    - .opencode/context/project-intelligence/technical-domain.md
    - .opencode/context/project-intelligence/navigation.md

FEATURES:
  ✓ Detects existing project intelligence
  ✓ Review and update existing patterns
  ✓ Validates MVI compliance (<200 lines)
  ✓ Auto-updates navigation.md
  ✓ Supports global patterns (--global flag)

EXAMPLES:
  ./router.sh                          # Interactive wizard
  ./router.sh --update                 # Update existing
  ./router.sh --tech-stack             # Update tech stack only
  ./router.sh --global                 # Save to global config

For more info, see: .opencode/skills/add-context/SKILL.md
HELP
}

# Check if CLI script exists
if [ ! -f "$CLI_SCRIPT" ]; then
    echo "❌ Error: add-context-cli.ts not found at $CLI_SCRIPT"
    exit 1
fi

# Find project root
find_project_root() {
    local dir
    dir="$(pwd)"
    while [ "$dir" != "/" ]; do
        if [ -d "$dir/.git" ] || [ -f "$dir/package.json" ]; then
            echo "$dir"
            return 0
        fi
        dir="$(dirname "$dir")"
    done
    pwd
    return 1
}

# Handle help
if [ "$1" = "help" ] || [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
  show_help
  exit 0
fi

# If no arguments, run wizard (default behavior)
if [ $# -eq 0 ]; then
    PROJECT_ROOT="$(find_project_root)"
    cd "$PROJECT_ROOT" && npx ts-node "$CLI_SCRIPT"
    exit $?
fi

# Run the CLI with all arguments
PROJECT_ROOT="$(find_project_root)"
cd "$PROJECT_ROOT" && npx ts-node "$CLI_SCRIPT" "$@"
exit $?
