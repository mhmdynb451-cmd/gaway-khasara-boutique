<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep storefront navigation in the shared SiteLayout so it remains available on customer and administration routes.
- Use /categories as the category directory and keep /category/$slug for each category's products, preserving existing URLs and data.
- Update cart state functionally and persist it after hydration so rapid actions retain every quantity update without overwriting the saved cart during startup.
- Prebundle React and Radix administration controls together in Vite so first-time navigation does not invalidate React's optimized modules mid-session and cause invalid hook calls.
- APK build: Capacitor wrapper (android/ committed) loads the live app via server.url in capacitor.config.ts; GitHub Actions workflow .github/workflows/android-apk.yml builds app-debug.apk as an artifact. Why: TanStack Start is SSR, so the native shell points at the hosted app instead of bundling a static build.
