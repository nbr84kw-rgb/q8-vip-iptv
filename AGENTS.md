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

- Keep authenticated TV screens inside the shared responsive AppShell: fixed side navigation on large screens and bottom navigation on small screens, so remote focus remains predictable.
- Lock text fields before programmatic remote focus and unlock only on explicit OK or pointer input, preventing the TV keyboard from appearing during channel navigation.
- Live fullscreen must use explicit full-height player styling for both browser fullscreen and the WebView fallback; channel changes remount the player to isolate playback attempts.
