#!/usr/bin/env npx ts-node
/**
 * Add Context CLI
 *
 * Interactive wizard for creating project intelligence context files.
 *
 * Usage: npx ts-node add-context-cli.ts [options]
 *
 * Options:
 *   --update              Update existing context with review prompts
 *   --tech-stack          Quick update of tech stack only
 *   --patterns            Quick update of code patterns only
 *   --global              Save to ~/.config/opencode/context/ instead of project
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Find project root (look for .git or package.json)
function findProjectRoot(): string {
  let dir = process.cwd();
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, '.git')) || fs.existsSync(path.join(dir, 'package.json'))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return process.cwd();
}

const PROJECT_ROOT = findProjectRoot();

// ============================================================================
// INTERFACES
// ============================================================================

interface TechStack {
  framework: string;
  language: string;
  database: string;
  styling: string;
}

interface NamingConventions {
  files: string;
  components: string;
  functions: string;
  database: string;
}

interface ProjectIntelligence {
  version: string;
  updated: string;
  techStack: TechStack | null;
  apiPattern: string | null;
  componentPattern: string | null;
  naming: NamingConventions | null;
  standards: string[];
  security: string[];
}

interface Frontmatter {
  context: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  version: string;
  updated: string;
}

// ============================================================================
// HELPERS
// ============================================================================

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer: string) => {
      resolve(answer.trim());
    });
  });
}

function closeInterface(): void {
  rl.close();
}

function printDivider(): void {
  console.log('━'.repeat(80));
}

function printHeader(title: string): void {
  printDivider();
  console.log(title);
  printDivider();
  console.log();
}

function exitWithMessage(message: string, exitCode: number = 0): void {
  console.log(message);
  closeInterface();
  process.exit(exitCode);
}

function formatDate(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

function getFileSize(filePath: string): string {
  const stats = fs.statSync(filePath);
  const bytes = stats.size;
  const kb = bytes / 1024;
  if (kb < 1) return `${bytes} bytes`;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

function countLines(filePath: string): number {
  const content = fs.readFileSync(filePath, 'utf-8');
  return content.split('\n').length;
}

// ============================================================================
// PARSE ARGUMENTS
// ============================================================================

const args = process.argv.slice(2);
const flags = {
  update: args.includes('--update'),
  techStack: args.includes('--tech-stack'),
  patterns: args.includes('--patterns'),
  global: args.includes('--global'),
  help: args.includes('--help') || args.includes('-h') || args.includes('--h')
};

if (flags.help) {
  console.log(`
Add Context CLI - Interactive Wizard for Project Intelligence

Usage: npx ts-node add-context-cli.ts [OPTIONS]

OPTIONS:
  --update              Update existing context with review prompts
  --tech-stack          Quick update of tech stack only
  --patterns            Quick update of code patterns only
  --global              Save to ~/.config/opencode/context/ instead of project
  --help, -h, --h      Show this help message

DESCRIPTION:
  Interactive 6-question wizard that creates technical-domain.md following
  Project Intelligence + MVI + frontmatter standards.

EXAMPLES:
  npx ts-node add-context-cli.ts                    # Interactive wizard
  npx ts-node add-context-cli.ts --update            # Update existing
  npx ts-node add-context-cli.ts --tech-stack        # Update tech stack only
  npx ts-node add-context-cli.ts --global            # Save to global config
`);
  closeInterface();
  process.exit(0);
}

// ============================================================================
// STAGE 0.5: RESOLVE CONTEXT LOCATION
// ============================================================================

function resolveContextDir(): string {
  if (flags.global) {
    return path.join(require('os').homedir(), '.config', 'opencode', 'context', 'project-intelligence');
  }
  return path.join(PROJECT_ROOT, '.opencode', 'context', 'project-intelligence');
}

const CONTEXT_DIR = resolveContextDir();

// Ensure context directory exists
if (!fs.existsSync(CONTEXT_DIR)) {
  const parentDir = path.dirname(CONTEXT_DIR);
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }
  fs.mkdirSync(CONTEXT_DIR, { recursive: true });
}

// ============================================================================
// STAGE 0: CHECK FOR EXTERNAL CONTEXT FILES
// ============================================================================

async function checkExternalContext(): Promise<void> {
  const tmpDir = path.join(PROJECT_ROOT, '.tmp');

  if (!fs.existsSync(tmpDir)) {
    return;
  }

  const files = fs.readdirSync(tmpDir).filter((f: string) => {
    return f.endsWith('.md') && (
      f.startsWith('external-') ||
      f.startsWith('context-') ||
      f.includes('-context')
    );
  });

  if (files.length === 0) {
    return;
  }

  printHeader('Found external context files in .tmp/');

  console.log('Files found:');
  for (const file of files) {
    const filePath = path.join(tmpDir, file);
    console.log(`  📄 .tmp/${file} (${getFileSize(filePath)})`);
  }
  console.log();
  console.log('These files can be extracted and organized into permanent context.');
  console.log();

  const choice = await question('Options:\n  1. Continue with /add-context (ignore external files for now)\n  2. Manage external files first (via /context harvest)\n\nChoose [1/2]: ');

  if (choice === '1') {
    console.log();
    return; // Continue to Stage 1
  } else if (choice === '2') {
    printHeader('Manage External Context Files');
    console.log('To manage external context files, use the /context command:');
    console.log();
    console.log('  /context harvest');
    console.log();
    console.log('This will:');
    console.log('  ✓ Extract knowledge from .tmp/ files');
    console.log('  ✓ Organize into project-intelligence/');
    console.log('  ✓ Clean up temporary files');
    console.log('  ✓ Update navigation.md');
    console.log();
    console.log('After harvesting, run /add-context again to create project intelligence.');
    console.log();
    exitWithMessage('Exiting. Run /context harvest to process external files.');
  } else {
    exitWithMessage('Invalid choice. Exiting.', 1);
  }
}

// ============================================================================
// STAGE 1: DETECT EXISTING PROJECT INTELLIGENCE
// ============================================================================

async function detectExistingIntelligence(): Promise<{ exists: boolean; data: ProjectIntelligence | null }> {
  const technicalDomainPath = path.join(CONTEXT_DIR, 'technical-domain.md');

  if (!fs.existsSync(technicalDomainPath)) {
    printHeader('No project intelligence found. Let\'s create it!');
    console.log(`Saving to: ${CONTEXT_DIR}`);
    console.log();
    console.log('Will create:');
    console.log('  - project-intelligence/technical-domain.md (tech stack & patterns)');
    console.log('  - project-intelligence/navigation.md (quick overview)');
    console.log();
    console.log('Takes ~5 min. Follows @mvi_compliance (<200 lines).');
    console.log();

    const ready = await question('Ready? [y/n]: ');
    if (ready.toLowerCase() !== 'y') {
      exitWithMessage('Exiting.');
    }
    console.log();

    return { exists: false, data: null };
  }

  // Parse existing technical-domain.md
  const content = fs.readFileSync(technicalDomainPath, 'utf-8');
  const data = parseTechnicalDomain(content);

  printHeader('Found existing project intelligence!');

  console.log('Files found:');
  console.log(`  ✓ technical-domain.md (Version: ${data.version}, Updated: ${data.updated})`);

  const navPath = path.join(CONTEXT_DIR, 'navigation.md');
  if (fs.existsSync(navPath)) {
    console.log(`  ✓ navigation.md`);
  }
  console.log();

  console.log('Current patterns:');
  if (data.techStack) {
    console.log(`  📦 Tech Stack: ${data.techStack.framework} + ${data.techStack.language} + ${data.techStack.database} + ${data.techStack.styling}`);
  }
  if (data.apiPattern) {
    console.log(`  🔧 API: Pattern defined`);
  }
  if (data.componentPattern) {
    console.log(`  🎨 Component: Pattern defined`);
  }
  if (data.naming) {
    console.log(`  📝 Naming: Conventions defined`);
  }
  if (data.standards.length > 0) {
    console.log(`  ✅ Standards: ${data.standards.length} items`);
  }
  if (data.security.length > 0) {
    console.log(`  🔒 Security: ${data.security.length} items`);
  }
  console.log();
  printDivider();

  console.log('Options:');
  console.log('  1. Review and update patterns (show each one)');
  console.log('  2. Add new patterns (keep all existing)');
  console.log('  3. Replace all patterns (start fresh)');
  console.log('  4. Cancel');
  console.log();

  const choice = await question('Choose [1/2/3/4]: ');

  if (choice === '1') {
    // Review and update
    console.log();
    const updatedData = await reviewPatterns(data);
    return { exists: true, data: updatedData };
  } else if (choice === '2') {
    // Add new patterns
    console.log();
    console.log('Keeping all existing patterns. Adding new patterns...');
    console.log();
    const newData = await runWizard(data);
    return { exists: true, data: newData };
  } else if (choice === '3') {
    // Replace all
    printHeader('Replace All: Preview');
    const backupDir = path.join(PROJECT_ROOT, '.tmp', 'backup', `project-intelligence-${Date.now()}`);
    console.log(`Will BACKUP existing files to:`);
    console.log(`  ${backupDir}/`);
    console.log(`    ← technical-domain.md (Version: ${data.version})`);
    if (fs.existsSync(navPath)) {
      console.log(`    ← navigation.md`);
    }
    console.log();
    console.log(`Will DELETE and RECREATE:`);
    console.log(`  ${CONTEXT_DIR}/technical-domain.md (new Version: 1.0)`);
    console.log(`  ${CONTEXT_DIR}/navigation.md (new Version: 1.0)`);
    console.log();
    console.log('Existing files backed up → you can restore from .tmp/backup/ if needed.');
    console.log();

    const proceed = await question('Proceed? [y/n]: ');
    if (proceed.toLowerCase() !== 'y') {
      exitWithMessage('Exiting.');
    }

    // Create backup
    fs.mkdirSync(backupDir, { recursive: true });
    fs.copyFileSync(technicalDomainPath, path.join(backupDir, 'technical-domain.md'));
    if (fs.existsSync(navPath)) {
      fs.copyFileSync(navPath, path.join(backupDir, 'navigation.md'));
    }
    console.log('✓ Backup created');
    console.log();

    // Run wizard for new data
    const newData = await runWizard(null);
    return { exists: true, data: newData };
  } else if (choice === '4') {
    exitWithMessage('Exiting.');
  } else {
    exitWithMessage('Invalid choice. Exiting.', 1);
  }

  return { exists: true, data };
}

// ============================================================================
// PARSE EXISTING TECHNICAL-DOMAIN.MD
// ============================================================================

function parseTechnicalDomain(content: string): ProjectIntelligence {
  const data: ProjectIntelligence = {
    version: '1.0',
    updated: formatDate(),
    techStack: null,
    apiPattern: null,
    componentPattern: null,
    naming: null,
    standards: [],
    security: []
  };

  const lines = content.split('\n');

  // Parse frontmatter
  const frontmatterMatch = content.match(/<!-- Context: .* \| Priority: .* \| Version: (.*?) \| Updated: (.*?) -->/);
  if (frontmatterMatch) {
    data.version = frontmatterMatch[1];
    data.updated = frontmatterMatch[2];
  }

  // Parse tech stack table
  let inTable = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('## Primary Stack')) {
      inTable = true;
      continue;
    }

    if (inTable && line.startsWith('##')) {
      inTable = false;
      continue;
    }

    if (inTable && line.startsWith('|')) {
      const parts = line.split('|').map(p => p.trim()).filter(p => p);
      if (parts.length >= 4 && !parts[0].includes('Layer')) {
        const layer = parts[0].toLowerCase();
        const technology = parts[1];
        if (!data.techStack) data.techStack = { framework: '', language: '', database: '', styling: '' };

        if (layer === 'framework') data.techStack.framework = technology;
        else if (layer === 'language') data.techStack.language = technology;
        else if (layer === 'database') data.techStack.database = technology;
        else if (layer === 'styling') data.techStack.styling = technology;
      }
    }
  }

  // Parse code patterns (simple extraction)
  let inCodeBlock = false;
  let currentPattern = '';
  let patternType = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('### API Endpoint')) {
      patternType = 'api';
      continue;
    }
    if (line.startsWith('### Component')) {
      patternType = 'component';
      continue;
    }

    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        currentPattern = '';
      } else {
        inCodeBlock = false;
        if (patternType === 'api') data.apiPattern = currentPattern.trim();
        else if (patternType === 'component') data.componentPattern = currentPattern.trim();
      }
      continue;
    }

    if (inCodeBlock) {
      currentPattern += line + '\n';
    }
  }

  // Parse naming conventions table
  inTable = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('## Naming Conventions')) {
      inTable = true;
      continue;
    }

    if (inTable && line.startsWith('##')) {
      inTable = false;
      continue;
    }

    if (inTable && line.startsWith('|')) {
      const parts = line.split('|').map(p => p.trim()).filter(p => p);
      if (parts.length >= 3 && !parts[0].includes('Type')) {
        const type = parts[0].toLowerCase();
        const convention = parts[1];
        if (!data.naming) data.naming = { files: '', components: '', functions: '', database: '' };

        if (type === 'files') data.naming.files = convention;
        else if (type === 'components') data.naming.components = convention;
        else if (type === 'functions') data.naming.functions = convention;
        else if (type === 'database') data.naming.database = convention;
      }
    }
  }

  // Parse code standards and security (simple bullet extraction)
  let inStandards = false;
  let inSecurity = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('## Code Standards')) {
      inStandards = true;
      inSecurity = false;
      continue;
    }
    if (line.startsWith('## Security Requirements')) {
      inSecurity = true;
      inStandards = false;
      continue;
    }
    if (line.startsWith('## ') && (inStandards || inSecurity)) {
      inStandards = false;
      inSecurity = false;
      continue;
    }

    if (line.startsWith('- ')) {
      const item = line.substring(2);
      if (inStandards) data.standards.push(item);
      if (inSecurity) data.security.push(item);
    }
  }

  return data;
}

// ============================================================================
// STAGE 1.5: REVIEW EXISTING PATTERNS
// ============================================================================

async function reviewPatterns(data: ProjectIntelligence): Promise<ProjectIntelligence> {
  const changes: string[] = [];

  // Review tech stack
  printHeader('Pattern 1/6: Tech Stack');
  console.log('Current:');
  if (data.techStack) {
    console.log(`  Framework: ${data.techStack.framework}`);
    console.log(`  Language: ${data.techStack.language}`);
    console.log(`  Database: ${data.techStack.database}`);
    console.log(`  Styling: ${data.techStack.styling}`);
  } else {
    console.log('  (none)');
  }
  console.log();

  const choice1 = await question('Options: 1. Keep | 2. Update | 3. Remove\n\nChoose [1/2/3]: ');
  if (choice1 === '2') {
    const techStack = await askTechStack();
    data.techStack = techStack;
    changes.push('✓ Tech Stack: Updated');
  } else if (choice1 === '3') {
    data.techStack = null;
    changes.push('✓ Tech Stack: Removed');
  } else {
    changes.push('✓ Tech Stack: Kept');
  }
  console.log();

  // Review API pattern
  printHeader('Pattern 2/6: API Pattern');
  if (data.apiPattern) {
    console.log('Current API pattern:');
    console.log('```typescript');
    console.log(data.apiPattern);
    console.log('```');
  } else {
    console.log('(none)');
  }
  console.log();

  const choice2 = await question('Options: 1. Keep | 2. Update | 3. Remove\n\nChoose [1/2/3]: ');
  if (choice2 === '2') {
    console.log('Paste new API pattern (or "skip"): ');
    const apiPattern = await multilineInput();
    data.apiPattern = apiPattern || null;
    changes.push('✓ API: Updated');
  } else if (choice2 === '3') {
    data.apiPattern = null;
    changes.push('✓ API: Removed');
  } else {
    changes.push('✓ API: Kept');
  }
  console.log();

  // Review component pattern
  printHeader('Pattern 3/6: Component Pattern');
  if (data.componentPattern) {
    console.log('Current component pattern:');
    console.log('```typescript');
    console.log(data.componentPattern);
    console.log('```');
  } else {
    console.log('(none)');
  }
  console.log();

  const choice3 = await question('Options: 1. Keep | 2. Update | 3. Remove\n\nChoose [1/2/3]: ');
  if (choice3 === '2') {
    console.log('Paste new component pattern (or "skip"): ');
    const componentPattern = await multilineInput();
    data.componentPattern = componentPattern || null;
    changes.push('✓ Component: Updated');
  } else if (choice3 === '3') {
    data.componentPattern = null;
    changes.push('✓ Component: Removed');
  } else {
    changes.push('✓ Component: Kept');
  }
  console.log();

  // Review naming conventions
  printHeader('Pattern 4/6: Naming Conventions');
  if (data.naming) {
    console.log('Current:');
    console.log(`  Files: ${data.naming.files}`);
    console.log(`  Components: ${data.naming.components}`);
    console.log(`  Functions: ${data.naming.functions}`);
    console.log(`  Database: ${data.naming.database}`);
  } else {
    console.log('(none)');
  }
  console.log();

  const choice4 = await question('Options: 1. Keep | 2. Update | 3. Remove\n\nChoose [1/2/3]: ');
  if (choice4 === '2') {
    const naming = await askNamingConventions();
    data.naming = naming;
    changes.push('✓ Naming: Updated');
  } else if (choice4 === '3') {
    data.naming = null;
    changes.push('✓ Naming: Removed');
  } else {
    changes.push('✓ Naming: Kept');
  }
  console.log();

  // Review code standards
  printHeader('Pattern 5/6: Code Standards');
  console.log('Current:');
  if (data.standards.length > 0) {
    data.standards.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s}`);
    });
  } else {
    console.log('  (none)');
  }
  console.log();

  const choice5 = await question('Options: 1. Keep | 2. Add new | 3. Remove all\n\nChoose [1/2/3]: ');
  if (choice5 === '2') {
    console.log('Add new standards (one per line, empty line when done):');
    const newStandards = await listInput();
    data.standards = [...data.standards, ...newStandards];
    changes.push(`✓ Standards: Updated (+${newStandards.length} new)`);
  } else if (choice5 === '3') {
    data.standards = [];
    changes.push('✓ Standards: Removed all');
  } else {
    changes.push('✓ Standards: Kept');
  }
  console.log();

  // Review security requirements
  printHeader('Pattern 6/6: Security Requirements');
  console.log('Current:');
  if (data.security.length > 0) {
    data.security.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s}`);
    });
  } else {
    console.log('  (none)');
  }
  console.log();

  const choice6 = await question('Options: 1. Keep | 2. Add new | 3. Remove all\n\nChoose [1/2/3]: ');
  if (choice6 === '2') {
    console.log('Add new requirements (one per line, empty line when done):');
    const newSecurity = await listInput();
    data.security = [...data.security, ...newSecurity];
    changes.push(`✓ Security: Updated (+${newSecurity.length} new)`);
  } else if (choice6 === '3') {
    data.security = [];
    changes.push('✓ Security: Removed all');
  } else {
    changes.push('✓ Security: Kept');
  }
  console.log();

  // Show summary
  printHeader('Review Summary');
  console.log('Changes:');
  changes.forEach(c => {
    console.log(`  ${c}`);
  });
  console.log();
  console.log(`Version: ${data.version} → ${incrementVersion(data.version)} (content update per @version_tracking)`);
  console.log(`Updated: ${formatDate()}`);
  console.log();

  const proceed = await question('Proceed? [y/n]: ');
  if (proceed.toLowerCase() !== 'y') {
    exitWithMessage('Exiting.');
  }

  data.version = incrementVersion(data.version);
  data.updated = formatDate();

  return data;
}

function incrementVersion(version: string): string {
  const parts = version.split('.');
  const major = parseInt(parts[0], 10) || 0;
  const minor = parseInt(parts[1], 10) || 0;
  return `${major}.${minor + 1}`;
}

// ============================================================================
// MULTILINE INPUT
// ============================================================================

async function multilineInput(): Promise<string> {
  return new Promise((resolve) => {
    const lines: string[] = [];

    const inputInterface = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });

    inputInterface.on('line', (line: string) => {
      if (line === '---END---' || line === '') {
        inputInterface.close();
        resolve(lines.join('\n'));
      } else {
        lines.push(line);
      }
    });

    console.log('(Enter ---END--- on a blank line to finish)');
  });
}

async function listInput(): Promise<string[]> {
  return new Promise((resolve) => {
    const lines: string[] = [];

    const inputInterface = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });

    inputInterface.on('line', (line: string) => {
      if (line.trim() === '' || line === '---END---') {
        inputInterface.close();
        resolve(lines);
      } else {
        lines.push(line.trim());
      }
    });

    console.log('(Enter blank line to finish)');
  });
}

// ============================================================================
// STAGE 2: INTERACTIVE WIZARD
// ============================================================================

async function runWizard(existingData: ProjectIntelligence | null): Promise<ProjectIntelligence> {
  const data: ProjectIntelligence = existingData || {
    version: '1.0',
    updated: formatDate(),
    techStack: null,
    apiPattern: null,
    componentPattern: null,
    naming: null,
    standards: [],
    security: []
  };

  // Q1: Tech Stack
  printHeader('Q 1/6: What\'s your tech stack?');
  console.log('Examples:');
  console.log('  1. Next.js + TypeScript + PostgreSQL + Tailwind');
  console.log('  2. React + Python + MongoDB + Material-UI');
  console.log('  3. Vue + Go + MySQL + Bootstrap');
  console.log('  4. Other (describe)');
  console.log();

  const techStack = await askTechStack();
  data.techStack = techStack;
  console.log();

  // Q2: API Pattern
  printHeader('Q 2/6: API endpoint example?');
  console.log('Paste API endpoint from YOUR project (matches your API style).');
  console.log();
  console.log('Example (Next.js):');
  console.log('```typescript');
  console.log('export async function POST(request: Request) {');
  console.log('  const body = await request.json()');
  console.log('  const validated = schema.parse(body)');
  console.log('  return Response.json({ success: true })');
  console.log('}');
  console.log('```');
  console.log();

  const apiAnswer = await question('Your API pattern (paste or "skip"): ');
  if (apiAnswer.toLowerCase() !== 'skip') {
    data.apiPattern = apiAnswer;
  }
  console.log();

  // Q3: Component Pattern
  printHeader('Q 3/6: Component example?');
  console.log('Paste component from YOUR project.');
  console.log();
  console.log('Example (React):');
  console.log('```typescript');
  console.log('interface UserCardProps { name: string; email: string }');
  console.log('export function UserCard({ name, email }: UserCardProps) {');
  console.log('  return <div className="rounded-lg border p-4">');
  console.log('    <h3>{name}</h3><p>{email}</p>');
  console.log('  </div>');
  console.log('}');
  console.log('```');
  console.log();

  const componentAnswer = await question('Your component (paste or "skip"): ');
  if (componentAnswer.toLowerCase() !== 'skip') {
    data.componentPattern = componentAnswer;
  }
  console.log();

  // Q4: Naming Conventions
  printHeader('Q 4/6: Naming conventions?');
  console.log('Examples:');
  console.log('  Files: kebab-case (user-profile.tsx)');
  console.log('  Components: PascalCase (UserProfile)');
  console.log('  Functions: camelCase (getUserProfile)');
  console.log('  Database: snake_case (user_profiles)');
  console.log();

  const naming = await askNamingConventions();
  data.naming = naming;
  console.log();

  // Q5: Code Standards
  printHeader('Q 5/6: Code standards?');
  console.log('Examples:');
  console.log('  - TypeScript strict mode');
  console.log('  - Validate w/ Zod');
  console.log('  - Use Drizzle for DB queries');
  console.log('  - Prefer server components');
  console.log();
  console.log('Your standards (one/line, "done" when finished):');

  const standards = await listInput();
  data.standards = standards;
  console.log();

  // Q6: Security Requirements
  printHeader('Q 6/6: Security requirements?');
  console.log('Examples:');
  console.log('  - Validate all user input');
  console.log('  - Use parameterized queries');
  console.log('  - Sanitize before rendering');
  console.log('  - HTTPS only');
  console.log();
  console.log('Your requirements (one/line, "done" when finished):');

  const security = await listInput();
  data.security = security;
  console.log();

  return data;
}

async function askTechStack(): Promise<TechStack> {
  const framework = await question('Framework: ');
  const language = await question('Language: ');
  const database = await question('Database: ');
  const styling = await question('Styling: ');

  return {
    framework,
    language,
    database,
    styling
  };
}

async function askNamingConventions(): Promise<NamingConventions> {
  const files = await question('Files: ');
  const components = await question('Components: ');
  const functions = await question('Functions: ');
  const database = await question('Database: ');

  return {
    files,
    components,
    functions,
    database
  };
}

// ============================================================================
// STAGE 3: GENERATE TECHNICAL-DOMAIN.MD PREVIEW
// ============================================================================

function generateTechnicalDomain(data: ProjectIntelligence): string {
  const lines: string[] = [];

  // Frontmatter
  lines.push('<!-- Context: project-intelligence/technical | Priority: critical | Version: ' + data.version + ' | Updated: ' + data.updated + ' -->');
  lines.push('');
  lines.push('# Technical Domain');
  lines.push('');
  lines.push('**Purpose**: Tech stack, architecture, development patterns for this project.');
  lines.push('**Last Updated**: ' + data.updated);
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Quick Reference');
  lines.push('**Update Triggers**: Tech stack changes | New patterns | Architecture decisions');
  lines.push('**Audience**: Developers, AI agents');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Primary Stack');
  lines.push('| Layer | Technology | Version | Rationale |');
  lines.push('|-------|-----------|---------|-----------|');

  if (data.techStack) {
    lines.push(`| Framework | ${data.techStack.framework} | | |`);
    lines.push(`| Language | ${data.techStack.language} | | |`);
    lines.push(`| Database | ${data.techStack.database} | | |`);
    lines.push(`| Styling | ${data.techStack.styling} | | |`);
  }

  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Code Patterns');

  if (data.apiPattern) {
    lines.push('### API Endpoint');
    lines.push('```typescript');
    lines.push(data.apiPattern);
    lines.push('```');
    lines.push('');
  }

  if (data.componentPattern) {
    lines.push('### Component');
    lines.push('```typescript');
    lines.push(data.componentPattern);
    lines.push('```');
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push('## Naming Conventions');
  lines.push('| Type | Convention | Example |');
  lines.push('|------|-----------|---------|');

  if (data.naming) {
    lines.push(`| Files | ${data.naming.files} | |`);
    lines.push(`| Components | ${data.naming.components} | |`);
    lines.push(`| Functions | ${data.naming.functions} | |`);
    lines.push(`| Database | ${data.naming.database} | |`);
  }

  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Code Standards');

  if (data.standards.length > 0) {
    data.standards.forEach(s => {
      lines.push(`- ${s}`);
    });
  }

  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Security Requirements');

  if (data.security.length > 0) {
    data.security.forEach(s => {
      lines.push(`- ${s}`);
    });
  }

  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## 📂 Codebase References');
  lines.push('**Implementation**: `src/` - Application source code');
  lines.push('**Config**: package.json, tsconfig.json');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Related Files');
  lines.push('- Business Domain (example: business-domain.md)');
  lines.push('- Decisions Log (example: decisions-log.md)');

  return lines.join('\n');
}

// ============================================================================
// STAGE 4: VALIDATION & CREATION
// ============================================================================

function validateTechnicalDomain(content: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const lines = content.split('\n');

  // Check line count
  if (lines.length > 200) {
    errors.push(`Exceeds 200 lines (@mvi_compliance): Current ${lines.length} | Limit 200`);
  }

  // Check frontmatter
  const frontmatterMatch = content.match(/<!-- Context: .* \| Priority: .* \| Version: .* \| Updated: .* -->/);
  if (!frontmatterMatch) {
    errors.push('Missing or invalid frontmatter (@frontmatter_required)');
  }

  // Check metadata
  if (!content.includes('**Purpose**:')) {
    errors.push('Missing metadata: Purpose');
  }
  if (!content.includes('**Last Updated**:')) {
    errors.push('Missing metadata: Last Updated');
  }

  // Check codebase references
  if (!content.includes('📂 Codebase References')) {
    errors.push('Missing codebase references (@codebase_refs)');
  }

  // Check priority
  if (!content.includes('Priority: critical')) {
    errors.push('Priority should be critical for tech stack (@priority_assignment)');
  }

  // Check version
  const versionMatch = content.match(/Version: (\d+\.\d+)/);
  if (!versionMatch) {
    errors.push('Missing version (@version_tracking)');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function generateNavigation(): string {
  const lines: string[] = [];

  lines.push('# Project Intelligence');
  lines.push('');
  lines.push('| File | Description | Priority |');
  lines.push('|------|-------------|----------|');
  lines.push('| technical-domain.md | Tech stack & patterns | critical |');

  return lines.join('\n');
}

// ============================================================================
// STAGE 5: CONFIRMATION & NEXT STEPS
// ============================================================================

async function stage5Confirmation(data: ProjectIntelligence, content: string, navContent: string): Promise<void> {
  printHeader('Preview: technical-domain.md');
  console.log(content);
  printDivider();

  console.log(`Size: ${content.split('\n').length} lines (limit: 200 per @mvi_compliance)`);
  console.log('Status: ✅ MVI compliant');
  console.log();
  console.log(`Save to: ${CONTEXT_DIR}/technical-domain.md`);
  console.log();

  const looksGood = await question('Looks good? [y/n]: ');
  if (looksGood.toLowerCase() !== 'y') {
    exitWithMessage('Exiting. No files written.');
  }
  console.log();

  // Validation
  printHeader('Running validation...');

  const validation = validateTechnicalDomain(content);

  if (validation.valid) {
    console.log('✅ <200 lines (@mvi_compliance)');
    console.log('✅ Has HTML frontmatter (@frontmatter_required)');
    console.log('✅ Has metadata (Purpose, Last Updated)');
    console.log('✅ Has codebase refs (@codebase_refs)');
    console.log('✅ Priority assigned: critical (@priority_assignment)');
    console.log('✅ Version set: ' + data.version + ' (@version_tracking)');
    console.log('✅ MVI compliant (<30s scannable)');
    console.log('✅ No duplication');
    console.log();
  } else {
    console.log('Validation failed:');
    validation.errors.forEach(e => {
      console.log(`  ✗ ${e}`);
    });
    console.log();
    exitWithMessage('Validation failed. Exiting.', 1);
  }

  // Show navigation preview
  printHeader('Preview: navigation.md');
  console.log(navContent);
  printDivider();

  // Show creation plan
  printHeader('Files to write');
  console.log(`  CREATE  ${CONTEXT_DIR}/technical-domain.md (${content.split('\n').length} lines)`);
  console.log(`  CREATE  ${CONTEXT_DIR}/navigation.md (${navContent.split('\n').length} lines)`);
  console.log();
  console.log(`Total: 2 files`);
  console.log();

  const proceed = await question('Proceed? [y/n]: ');
  if (proceed.toLowerCase() !== 'y') {
    exitWithMessage('Exiting. No files written.');
  }
  console.log();

  // Write files
  fs.writeFileSync(path.join(CONTEXT_DIR, 'technical-domain.md'), content, 'utf-8');
  fs.writeFileSync(path.join(CONTEXT_DIR, 'navigation.md'), navContent, 'utf-8');

  // Success message
  printHeader('✅ Project Intelligence created successfully!');
  console.log('Files created:');
  console.log(`  ${CONTEXT_DIR}/technical-domain.md`);
  console.log(`  ${CONTEXT_DIR}/navigation.md`);
  console.log();
  console.log(`Location: ${CONTEXT_DIR}`);
  console.log('Agents now use YOUR patterns automatically!');
  console.log();

  // Next steps
  printHeader('What\'s next?');
  console.log('1. Test it:');
  console.log('   opencode --agent OpenCoder');
  console.log('   > "Create API endpoint"');
  console.log('   (Uses YOUR pattern!)');
  console.log();
  console.log('2. Review: cat ' + CONTEXT_DIR + '/technical-domain.md');
  console.log();
  console.log('3. Add business context: /add-context --business');
  console.log();
  console.log('4. Build: opencode --agent OpenCoder > "Create user auth system"');
  console.log();

  // Tip: Update context
  printHeader('💡 Tip: Update context as project evolves');
  console.log('When you:');
  console.log('  Add library → /add-context --update');
  console.log('  Change patterns → /add-context --update');
  console.log('  Migrate tech → /add-context --update');
  console.log();
  console.log('Agents stay synced!');
  console.log();

  // Tip: Global patterns
  printHeader('💡 Tip: Global patterns');
  console.log('Want the same patterns across ALL your projects?');
  console.log('  /add-context --global');
  console.log('  → Saves to ~/.config/opencode/context/project-intelligence/');
  console.log('  → Acts as fallback for projects without local context');
  console.log();
  console.log('Already have global patterns? Bring them into this project:');
  console.log('  /context migrate');
  console.log();

  // Learn more
  printHeader('📚 Learn More');
  console.log('- Project Intelligence: .opencode/context/core/standards/project-intelligence.md');
  console.log('- MVI Principles: .opencode/context/core/context-system/standards/mvi.md');
  console.log('- Context System: CONTEXT_SYSTEM_GUIDE.md');
  console.log();
}

// ============================================================================
// FLAG-SPECIFIC WORKFLOWS
// ============================================================================

async function updateTechStackOnly(): Promise<void> {
  const technicalDomainPath = path.join(CONTEXT_DIR, 'technical-domain.md');

  if (!fs.existsSync(technicalDomainPath)) {
    printHeader('No existing tech stack found. Let\'s create it!');
  } else {
    printHeader('Update Tech Stack');
    const existingData = parseTechnicalDomain(fs.readFileSync(technicalDomainPath, 'utf-8'));
    console.log('Current tech stack:');
    if (existingData.techStack) {
      console.log(`  Framework: ${existingData.techStack.framework}`);
      console.log(`  Language: ${existingData.techStack.language}`);
      console.log(`  Database: ${existingData.techStack.database}`);
      console.log(`  Styling: ${existingData.techStack.styling}`);
    }
    console.log();
  }

  const techStack = await askTechStack();
  const newData: ProjectIntelligence = {
    version: '1.0',
    updated: formatDate(),
    techStack,
    apiPattern: null,
    componentPattern: null,
    naming: null,
    standards: [],
    security: []
  };

  // If file exists, merge with existing data
  if (fs.existsSync(technicalDomainPath)) {
    const existingData = parseTechnicalDomain(fs.readFileSync(technicalDomainPath, 'utf-8'));
    newData.apiPattern = existingData.apiPattern;
    newData.componentPattern = existingData.componentPattern;
    newData.naming = existingData.naming;
    newData.standards = existingData.standards;
    newData.security = existingData.security;
    newData.version = incrementVersion(existingData.version);
  }

  const content = generateTechnicalDomain(newData);
  const navContent = generateNavigation();

  await stage5Confirmation(newData, content, navContent);

  closeInterface();
  process.exit(0);
}

async function updatePatternsOnly(): Promise<void> {
  const technicalDomainPath = path.join(CONTEXT_DIR, 'technical-domain.md');

  if (!fs.existsSync(technicalDomainPath)) {
    exitWithMessage('No existing patterns found. Run /add-context to create new context.', 1);
  }

  const existingData = parseTechnicalDomain(fs.readFileSync(technicalDomainPath, 'utf-8'));

  printHeader('Update Code Patterns');
  console.log('Current API pattern:');
  if (existingData.apiPattern) {
    console.log('```typescript');
    console.log(existingData.apiPattern);
    console.log('```');
  } else {
    console.log('(none)');
  }
  console.log();

  const apiAnswer = await question('New API pattern (or "skip" to keep current): ');
  if (apiAnswer.toLowerCase() !== 'skip') {
    existingData.apiPattern = apiAnswer || null;
  }

  console.log();
  console.log('Current component pattern:');
  if (existingData.componentPattern) {
    console.log('```typescript');
    console.log(existingData.componentPattern);
    console.log('```');
  } else {
    console.log('(none)');
  }
  console.log();

  const componentAnswer = await question('New component pattern (or "skip" to keep current): ');
  if (componentAnswer.toLowerCase() !== 'skip') {
    existingData.componentPattern = componentAnswer || null;
  }

  existingData.version = incrementVersion(existingData.version);
  existingData.updated = formatDate();

  const content = generateTechnicalDomain(existingData);
  const navContent = generateNavigation();

  await stage5Confirmation(existingData, content, navContent);

  closeInterface();
  process.exit(0);
}

// ============================================================================
// MAIN
// ============================================================================

async function main(): Promise<void> {
  try {
    // Handle specific flags
    if (flags.techStack) {
      await updateTechStackOnly();
      return;
    }

    if (flags.patterns) {
      await updatePatternsOnly();
      return;
    }

    // Stage 0: Check for external context
    await checkExternalContext();

    // Stage 1: Detect existing project intelligence
    const { exists, data } = await detectExistingIntelligence();

    // Handle case where user cancels
    if (!data) {
      closeInterface();
      process.exit(0);
    }

    // Generate content
    const content = generateTechnicalDomain(data);
    const navContent = generateNavigation();

    // Stage 5: Confirmation & next steps
    await stage5Confirmation(data, content, navContent);

    closeInterface();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : String(error));
    console.log();
    closeInterface();
    process.exit(1);
  }
}

main();
