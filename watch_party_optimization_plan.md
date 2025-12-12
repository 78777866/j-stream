# Watch Party Optimization Plan

## 1. Playback Synchronization (Episode/Season)
**Issue**: Currently, if the host changes the episode, guests remain on the old episode.
**Fix**:
- **Host Side**: When the host changes the episode (via `handleChangeEpisode`), update the `watch_parties` table with the new `season_number` and `episode_number`.
- **Guest Side**: Listen for updates to `watch_parties`. When `season_number` or `episode_number` changes, automatically find the corresponding episode in the `seasons` data and switch to it.
**Status**: Implemented in `EmbedPlayer`. Host updates DB on episode change. Guests sync on DB update. "Force Sync" button also updated to push current state.

## 2. Realtime Presence (Who is Online)
**Issue**: There is no visibility into who is currently in the party.
**Fix**:
- Implement Supabase Realtime Presence.
- Add a "Participants" list in the UI (maybe in `ChatPanel` or `Controls`).
- Track user status (online/offline).
**Status**: Implemented in `ChatPanel`. Shows "X online".

## 3. Chat Optimizations
**Issue**: 
- `getProfiles` is called naively. 
- Realtime listeners are set up inside the component, which can lead to multiple listeners if not handled carefully (though `useEffect` cleanup handles it).
- Chat could use optimistic updates for better responsiveness.
**Fix**:
- Ensure `getProfiles` handles cache better (already somewhat handled in state).
- Add "User typing..." indicators using Presence.
**Status**: Typing indicators implemented using Broadcast channel. `getProfiles` uses local state cache.

## 4. Initial Load Performance
**Issue**: `EmbedPlayer` fetches movie/show data. `ChatPanel` fetches messages.
**Fix**:
- Parallelize data fetching where possible.
**Status**: Components fetch data in parallel as they mount.

## 5. Security / RLS (Review)
- Ensure policies allow only party members (or public if open) to read/write.
- (Cannot verify without DB access, but can add notes).
**Status**: Code assumes Supabase RLS is configured correctly.

## Implementation Steps
1.  Modify `WatchPartyService` to support `updatePlaybackState` better (already exists).
2.  Update `EmbedPlayer` to sync episode changes.
3.  Add Presence logic to `ChatPanel` or a new component.
