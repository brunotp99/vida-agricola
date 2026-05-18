#!/usr/bin/env bash

INPUT=$(cat)
TASK_TITLE=$(echo "$INPUT" | jq -r '.task.title // "completed task"' 2>/dev/null || echo "completed task")

PROJECT_DIR="/Users/brunotp99/Downloads/agriculture-ecommerce-app"
cd "$PROJECT_DIR" || { echo "Cannot cd to project directory"; exit 2; }

# TypeScript check
TSC_OUTPUT=$(pnpm tsc --noEmit 2>&1)
TSC_EXIT=$?

# ESLint
LINT_OUTPUT=$(pnpm lint 2>&1)
LINT_EXIT=$?

if [ "$TSC_EXIT" -ne 0 ] || [ "$LINT_EXIT" -ne 0 ]; then
  echo "Pre-commit checks FAILED after completing: $TASK_TITLE"
  echo "Fix these errors before the task can be considered done:"
  echo ""
  if [ "$TSC_EXIT" -ne 0 ]; then
    echo "=== TypeScript ==="
    echo "$TSC_OUTPUT" | grep -E "error TS|\.tsx?:[0-9]" | head -15
    echo ""
  fi
  if [ "$LINT_EXIT" -ne 0 ]; then
    echo "=== ESLint ==="
    echo "$LINT_OUTPUT" | grep -E "^\s+[0-9]+:[0-9]+\s+(error|warning)|^/" | head -15
    echo ""
  fi
  exit 2
fi

# Both passed — stage everything and commit
git add -A

if git diff --cached --quiet; then
  printf '{"systemMessage": "✅ TypeScript + lint passed. No changes to commit."}'
  exit 0
fi

git commit -m "$TASK_TITLE" -m "" -m "Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

printf '{"systemMessage": "✅ Checks passed. Committed: %s"}' "$TASK_TITLE"
