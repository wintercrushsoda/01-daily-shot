# Daily Shot Studio

Browser-based editor workspace built with Vue 3 and Vite.

## Project Structure

- `src/App.vue` - root shell that mounts the editor workspace
- `src/features/editor/` - feature-scoped editor UI and workspace data
- `src/shared/ui/` - reusable surface components used across features
- `src/assets/` - global styles and design tokens

## Scripts

```sh
npm install
npm run dev
npm run build
```

## Notes

- The editor layout is split into top bar, sidebar, canvas, and inspector panels.
- Workspace content is data-driven so new modules can be added without rewriting the shell.
- The current release checklist and data are placeholder content for the first deployable structure.

## Image Export Notes

- Blank cards can still be exported. Missing nickname, text, profile image, background image, or cut image does not block saving.
- Export can fail if the browser blocks `foreignObject` rendering, if the source DOM is missing, or if the image file is unreadable/corrupted.
- Export can also fail when the browser cannot decode a selected image file, or when the page is in an unsupported/very old browser environment.
- If export fails, retry after reselecting the image file or refreshing the page.
