/**
 * Image URL helper — pass-through (Supabase Transform API requires Pro plan)
 * All functions return the original URL unchanged.
 */
export const getOptimizedImageUrl = (url: string | null | undefined): string => url ?? '';
export const imgHero  = (url: string | null | undefined) => url ?? '';
export const imgCard  = (url: string | null | undefined) => url ?? '';
export const imgThumb = (url: string | null | undefined) => url ?? '';
export const imgCert  = (url: string | null | undefined) => url ?? '';

