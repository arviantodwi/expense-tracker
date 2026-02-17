# Add Context Skill

**Purpose**: Interactive wizard for creating project intelligence context files

**Last Updated**: 2026-02-18

---

## Description

Interactive 6-question wizard that creates `technical-domain.md` following Project Intelligence + MVI + frontmatter standards. Helps users teach AI agents their coding patterns through a simple question-and-answer format.

---

## Usage

```bash
router.sh                      # Interactive wizard (recommended)
router.sh --update            # Update existing context
router.sh --tech-stack        # Add/update tech stack only
router.sh --patterns          # Add/update code patterns only
router.sh --global            # Save to global config instead of project
```

---

## Commands

| Command | Description |
|---------|-------------|
| (no args) | Interactive wizard (default) |
| `--update` | Update existing context with review prompts |
| `--tech-stack` | Quick update of tech stack only |
| `--patterns` | Quick update of code patterns only |
| `--global` | Save to `~/.config/opencode/context/` instead of project |

---

## Quick Start

```bash
# Interactive wizard (recommended)
./router.sh

# Will ask:
# 1. Tech stack? (e.g., Next.js + TypeScript + PostgreSQL + Tailwind)
# 2. API endpoint example? (paste from your project)
# 3. Component example? (paste from your project)
# 4. Naming conventions? (files, components, functions, database)
# 5. Code standards? (list, one per line)
# 6. Security requirements? (list, one per line)

# Creates:
# - .opencode/context/project-intelligence/technical-domain.md
# - .opencode/context/project-intelligence/navigation.md
```

---

## Workflow

### Stage 0.5: Resolve Context Location
- Default: `.opencode/context/project-intelligence/` (project-local)
- Override: `--global` flag → `~/.config/opencode/context/project-intelligence/`

### Stage 0: External Context Detection
- Checks `.tmp/` for external context files
- Offers to run `/context harvest` if found

### Stage 1: Existing Context Detection
- Checks if `technical-domain.md` exists
- Offers: Review/Add/Replace/Cancel

### Stage 1.5: Pattern Review (if updating)
- For each pattern: Keep/Update/Remove
- Tracks changes for version calculation

### Stage 2: Interactive Wizard (6 questions)
- Tech stack, API pattern, Component pattern
- Naming conventions, Code standards, Security requirements

### Stage 3: Generate Preview
- Shows full `technical-domain.md` preview
- Asks for confirmation

### Stage 4: Validation & Creation
- Validates MVI compliance (<200 lines)
- Validates frontmatter format
- Creates files

### Stage 5: Confirmation & Next Steps
- Success message
- Next steps guidance
- Tips for updates

---

## Output Files

### technical-domain.md
Location: `.opencode/context/project-intelligence/technical-domain.md`

Contains:
- Frontmatter with metadata
- Primary Stack table
- Code Patterns (API, Component)
- Naming Conventions table
- Code Standards list
- Security Requirements list
- Codebase References section
- Related Files links

### navigation.md
Location: `.opencode/context/project-intelligence/navigation.md`

Contains:
- Table of all project intelligence files
- File descriptions and priorities

---

## Standards Compliance

✅ **MVI Compliance**: Files <200 lines, scannable in <30s
✅ **Frontmatter Required**: HTML comment with metadata
✅ **Codebase References**: Links context to actual code
✅ **Navigation Update**: Automatically updates navigation.md
✅ **Priority Assignment**: Critical for tech stack (80% use cases)
✅ **Version Tracking**: 1.0 for new, incremented for updates

---

## Examples

### First Time Setup
```bash
./router.sh

# Answers:
# 1. Next.js + TypeScript + PostgreSQL + Tailwind
# 2. [pastes Next.js API route]
# 3. [pastes React component]
# 4-6. [answers conventions, standards, security]

✅ Created: technical-domain.md, navigation.md
```

### Update Existing
```bash
./router.sh --update

# Found existing → Choose "Review and update"
# Pattern 1: Tech Stack → Update (Next.js 14 → 15)
# Patterns 2-6: Keep

✅ Updated: Version 1.2 → 1.3
```

### Quick Tech Stack Update
```bash
./router.sh --tech-stack

# Current: Next.js 14 + TypeScript + PostgreSQL + Tailwind
# New: Next.js 15 + TypeScript + PostgreSQL + Drizzle + Tailwind

✅ Updated: Version 1.4 → 1.5
```

---

## File Structure

```
.opencode/skills/add-context/
├── SKILL.md                    # This file
├── router.sh                   # Bash router
└── scripts/
    └── add-context-cli.ts      # TypeScript implementation
```

---

## Related Commands

- `/context` - Manage context files (harvest, organize, validate)
- `/context harvest` - Extract and organize external context
- `/context validate` - Check integrity

---

## More Information

**Full Specification**: `.opencode/command/add-context.md`

**Standards**:
- Project Intelligence: `.opencode/context/core/standards/project-intelligence.md`
- MVI Principles: `.opencode/context/core/context-system/standards/mvi.md`
- Context System: `CONTEXT_SYSTEM_GUIDE.md`
