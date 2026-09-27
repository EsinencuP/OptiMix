# Icon and motion sources for Optimix

Codex has three user level MCP servers configured for future design work:

| Server | Connection | Intended use |
| --- | --- | --- |
| `universal-icons` | `npx -y mcp-universal-icons` | Consistent open source UI symbols and raw SVG paths |
| `lottiefiles-creator` | `npx -y @lottiefiles/creator-mcp@latest` | Authoring a specific Lottie animation in an open Creator tab |
| `iconscout` | `https://mcp.iconscout.com/mcp` | Finding licensed icon and animation assets |

For each new asset, record its source, collection, icon name or asset ID, and license terms. Keep production assets in the repository so the website never depends on a live MCP connection. Review exported SVG markup before using it: the current `universal-icons` response for Lucide `arrow-up-right` contained an invalid `stroke-` attribute, which was removed in the site version. Preserve `currentColor`, visible focus states and reduced motion behavior.

The recognition card action icon uses the Lucide `arrow-up-right` path retrieved through `universal-icons`. The five larger illustrations remain site specific SVG compositions. Their geometry and motion have been checked separately in the browser. IconScout OAuth has completed. Lottie Creator is registered in Codex and Local MCP is enabled in the Creator tab, but a live bridge session has not yet been confirmed. No downloaded Lottie or IconScout asset has been added to the site yet.
