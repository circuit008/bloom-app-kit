

## Three Issues Found

### Issue 1: Password Reset Link Goes to 404

**Root cause**: Two problems:
- The `ResetPassword` page (line 34) navigates to `/login` on invalid session, but **no `/login` route exists** in App.tsx. This causes a 404.
- The session/hash check runs before Supabase's client has time to process the recovery token from the URL. The proper approach is to listen for the `PASSWORD_RECOVERY` event via `onAuthStateChange`.

**Fix**: Rewrite `ResetPassword.tsx` to:
1. Use `supabase.auth.onAuthStateChange` to listen for `PASSWORD_RECOVERY` event instead of manually parsing URL hash.
2. Navigate to `/` instead of `/login` on failure (since `/login` doesn't exist as a route).

### Issue 2: No User Information Visible in Backend

The `user_profiles` table exists and is working (network requests confirm data is there). To view your data, you can open the backend panel.

<lov-actions>
  <lov-open-backend>View Backend</lov-open-backend>
</lov-actions>

### Issue 3: Accessibility Check Fails After IP Check

**Root cause**: In `AccessibilityCheck.tsx` (line 97), the image is loaded with `img.crossOrigin = "anonymous"`. When `preview` is a **data URL** (from FileReader), setting `crossOrigin` can cause the canvas to be tainted or the image load to fail silently in some browsers, preventing `getImageData` from working.

**Fix**: In `AccessibilityCheck.tsx`, only set `crossOrigin = "anonymous"` when the URL is NOT a data URL:
```typescript
if (!imageUrl.startsWith("data:")) {
  img.crossOrigin = "anonymous";
}
```

---

### Implementation Summary

1. **`src/pages/ResetPassword.tsx`** - Rewrite session detection to use `onAuthStateChange` with `PASSWORD_RECOVERY` event; change fallback nav from `/login` to `/`.
2. **`src/components/scan/AccessibilityCheck.tsx`** - Conditionally set `crossOrigin` only for non-data URLs.

