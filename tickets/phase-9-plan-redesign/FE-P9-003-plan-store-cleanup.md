# FE-P9-003: Clean Up Plan Store for New Plan Mode

**Phase:** 9 - Plan Mode Redesign
**Assignee:** FE (Frontend Dev)
**Priority:** Medium
**Dependencies:** FE-P9-001

## Description
Simplify the planStore to match the new text-based plan flow where steps don't carry content.

## Current State
- `PlanStep` has `content?: string` and `approved: boolean`
- `updateStepContent()` allows editing step content inline
- `getApprovedSteps()` returns steps with content for execution

## New State
- `PlanStep` keeps `approved` but `content` is always undefined at plan time
- Remove `updateStepContent()` action -- no longer needed
- `getApprovedSteps()` returns steps without content (backend generates during execution)

## Files to Modify
- `packages/web/src/stores/planStore.ts` -- Remove `updateStepContent`, simplify types
