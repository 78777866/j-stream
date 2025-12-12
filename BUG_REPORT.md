# Bug Hunt Report

This repo currently builds with `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds` enabled, so several runtime/type issues can slip through.

## High-impact functional bugs

1. **Client-side navigation uses relative URLs (missing leading `/`) in multiple places**
   - `src/components/hero.tsx` – `window.history.pushState(..., `${path}/${getSlug(...)}`)` where `path` is `movies`/`tv-shows`.
   - `src/components/shows-carousel.tsx` (`ShowCard`) – same pattern.
   - `src/components/navigation/main-nav.tsx` – `window.history.pushState/replaceState(..., `search?q=${value}`)` missing `/search?...`.
   - Impact: URLs can resolve relative to the current route (e.g. `/home/movies/...`), breaking deep links and popstate behavior.

2. **Anime watch route / embed logic is broken for `m-<id>` slugs (and `url` prop is ignored)**
   - `src/app/watch/anime/[slug]/page.tsx`
     - `movieId` is the full slug (e.g. `m-123`), but `mediaType` is set to `MediaType.ANIME` only when the slug contains `t`.
   - `src/components/watch/embed-player.tsx`
     - ID normalization only strips `t-` (`movieId.replace('t-', '')`), so `m-123` becomes an invalid TMDB id and produces invalid embed URLs.
     - `props.url` is never used.
   - Impact: anime movies (`m-...`) cannot play; continue-watching tracking can store incorrect IDs.

3. **NaN “% Match” shown in UI when vote_average is missing**
   - `src/components/hero.tsx` – `Math.round(randomShow?.vote_average * 10) ?? '-'` will render `NaN` (because `NaN ?? '-'` is still `NaN`).
   - `src/components/shows-carousel.tsx` – same pattern.
   - `src/components/shows-modal.tsx` – `Math.round((Number(modalStore.show?.vote_average) / 10) * 100) ?? '-'` can also yield `NaN`.

4. **Search reset can throw when the search input is not present**
   - `src/lib/utils.ts` → `clearSearch()`
     - `document.getElementById('search-input') as HTMLInputElement` can be `null` at runtime, then `searchInput.blur()` throws.
   - `src/stores/search.ts` calls `clearSearch()` inside `reset()`.

5. **Debounce implementation is globally shared across all uses**
   - `src/lib/utils.ts` → `let timer: NodeJS.Timeout;` at module scope.
   - `debounce()` clears/sets that single timer for *all* debounced functions.
   - Impact: separate debounced inputs/actions can cancel each other’s timers.

## Data freshness / logic bugs

6. **Hard-coded “lte” dates for anime discovery endpoints will go stale**
   - `src/services/MovieService/MovieService.ts` (`urlBuilder`)
   - Example: `release_date.lte=2024-11-10`, `air_date.lte=2024-11-10`.
   - Impact: after the hardcoded cutoff, “latest/trending” anime queries can stop returning expected results.

7. **Modal details fetch does not react to show changes**
   - `src/components/shows-modal.tsx`
   - `handleGetData()` is called only once on mount (`useEffect(..., [])`), but the modal can open for different shows without remounting.
   - Impact: trailer/genres/keywords can be stale from the previous show.

## Type/runtime issues currently masked by build config

8. **`src/app/(front)/tamil-movies/tamil-movies-content.tsx` references enum values that don’t exist**
   - Uses `RequestType.TAMIL_TRENDING`, `RequestType.TAMIL_LATEST`, etc.
   - `src/enums/request-type.ts` defines no Tamil request types.

9. **`src/stores/modal.ts` type mismatch: store exposes `setFirstLoad` but interface does not**
   - Interface `ModalState` omits `setFirstLoad`, but store implementation defines it.

10. **`src/components/tamil-movie-modal.tsx` contains placeholder/invalid logic**
   - Always sets the YouTube ID to `dQw4w9WgXcQ`.
   - IMDB link uses TMDB id (`tt${movie.id}`), which is not a valid IMDB id.
   - Custom YouTube types don’t match actual `react-youtube` API (`getPlayerState()` missing from type).

## Security / configuration issues

11. **`.env` is committed and not ignored**
   - Root `.gitignore` does not include `.env`.
   - Root `.env` contains tokens/keys.
   - Impact: easy accidental secret leakage; encourages using production-like values in git history.

12. **TMDB read token is configured as `NEXT_PUBLIC_TMDB_TOKEN`**
   - `src/env.mjs` declares `NEXT_PUBLIC_TMDB_TOKEN` as a client-side env var.
   - `src/services/BaseService/BaseService.ts` uses it as a Bearer token.
   - Impact: token is bundled to the client, allowing third parties to reuse it.

## Cross-platform tooling risk

13. **`package-lock.json` appears to be missing a platform SWC entry**
   - The lockfile no longer lists `@next/swc-win32-x64-msvc` (an optional dependency used on Windows).
   - Impact: Windows installs/builds may fail or fall back unexpectedly.
