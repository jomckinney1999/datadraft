/**
 * What a lesson play is worth. Its own module so the lesson player can price
 * a play without importing the curriculum (2026-10-06); lib/curriculum.ts
 * re-exports these, so existing imports keep working.
 */
export const XP_PER_EXERCISE = 10;
export const XP_RETRY = 5;
export const PERFECT_BONUS = 20;
