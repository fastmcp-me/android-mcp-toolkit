# Android MCP Toolkit for AI Agents

Small MCP server with two tools:
- Fast SVG → Android VectorDrawable conversion (cached, file or inline).
- adb logcat reader with package/pid/tag filters for quick crash triage.

## Why this exists
- Speed up “SVG to VectorDrawable” without opening Android Studio.
- Grab and filter adb logs (package/pid/tag) directly from MCP clients.
- Provide consistent, scriptable output for MCP agents.
- Leave room to add more Android utilities (e.g., bitmap → vector helpers, asset validators) under the same MCP server in the future.

## Pairing ideas
- **Figma MCP**: grab SVGs from designs, feed to `convert-svg-to-android-drawable` to get XML for Android resources.
- **Debugging**: while running the app, call `read-adb-logcat` with package name or tag to capture crashes and filtered logs without leaving the MCP client.

### Previews
**SVG to VectorDrawable**
- Figma request → SVG extraction  
  ![Figma request via MCP](assets/figma/figma-request.png)
- Flag conversion preview (single)  
  ![Flag conversion preview](assets/figma/flag-uk-preview.png)
- Batch flag review (side-by-side)  
  ![Batch flag review](assets/figma/flag-batch-review.png)
- Batch run via MCP (console)  
  ![Batch run via MCP](assets/figma/flag-batch-runs.png)

**ADB logcat tool**
- Crash capture prompt (inputs + filters)  
  ![Crash logcat prompt](assets/figma/my%20app%20just.png)
- Response preview (summarized logcat)  
  ![Response gap prompt](assets/figma/Isease%20gap.png)

## Current tools
- `convert-svg-to-android-drawable`
  - Inputs: `svg` (inline) **or** `svgPath` (file path). Optional: `outputPath`, `floatPrecision` (default 2), `fillBlack` (default false), `xmlTag` (default false), `tint`, `cache` (default true).
  - Output: VectorDrawable XML text; also writes to disk when `outputPath` is provided.
  - Performance: LRU cache (32 entries) keyed by SVG + options plus fast reuse in-session.
  - Converter: vendored fork in `vendor/svg2vectordrawable` with fixes for `rgb()/rgba()`, `hsl()/hsla()`, and named colors. Upstream license: `vendor/svg2vectordrawable/LICENSE` (MIT).

- `read-adb-logcat`
  - Inputs: `packageName` (resolve pid via `adb shell pidof -s`), `pid` (explicit), `tag`, `priority` (`V|D|I|W|E|F|S`, default `V`), `maxLines` (tail count, default `200`, max `2000`), `timeoutMs` (default `5000`, max `15000`).
  - Behavior: Runs `adb logcat -d -t <maxLines>` with optional `--pid=<pid>` and `-s tag:priority`.
  - Output: Returns the logcat text; if no lines are returned, responds with a short message.
  - Notes: Requires `adb` available in PATH and a connected device/emulator. Provide at least one of `packageName`, `pid`, or `tag` to scope logs.

## Roadmap (planned)
- Additional MCP tools for Android assets (e.g., batch conversions, validations, optimizers).
- Optional resource prompts for common Android drawables/templates.
- Upcoming MCP utilities (planned):
  - Logcat reader: stream and filter Android logcat output via MCP.
  - Asset checkers: flag common drawable issues (size, alpha, color profile).
  - Batch conversions: multi-SVG to VectorDrawable with consistent options.
  - Template prompts: quick-start drawable/XML snippets for common patterns.

## Quick start
- `npm install`
- `npm start` (keeps running on stdio; point your MCP client at `node src/index.js`)

## Run via npx
- From repo root: `npx .` (uses `svg-to-drawable-mcp` bin; runs on stdio)

## Run with Docker
- Build: `docker build -t svg-to-drawable-mcp .`
- Run: `docker run --rm -it svg-to-drawable-mcp`
- The container prints to stdio; point your MCP client at `docker run --rm -i svg-to-drawable-mcp`.

## Use in Cursor (MCP config)
Add to your Cursor settings JSON:
```json
{
  "mcpServers": {
    "figma-desktop": {
      "url": "http://127.0.0.1:3845/mcp"
    },
    "svg-to-android-drawable": {
      "command": "npx",
      "args": [
        "-y",
        "/Users/admin/code/android_util_mcp_server"
      ]
    }
  }
}
```
Adjust the local path if your repo lives elsewhere.

## Examples
- Input SVG: `sample_svg.svg`
- Output VectorDrawable: `examples/sample_svg.xml`

## Notes
- Transport: stdio via `@modelcontextprotocol/sdk`.
- Base deps kept minimal; everything needed to convert SVGs is vendored/included.

## Contact
- nam.nv205106@gmail.com
