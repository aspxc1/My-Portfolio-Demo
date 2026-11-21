import { hero, profile, stack } from "../src/content/site.js"
import projects from "../src/content/projects.json"
import activities from "../src/content/activities.json"
import { isCliUserAgent, renderAnsiPortfolio } from "../src/lib/ansiCard.js"

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const pathname = url.pathname
    const userAgent = request.headers.get("user-agent") || ""
    const accept = request.headers.get("accept") || ""
    const format = url.searchParams.get("format")

    if (pathname === "/json" || pathname === "/api/portfolio.json") {
      return new Response(
        JSON.stringify({
          profile,
          facts: hero.neofetch,
          stack: stack.filter((group) => !group.hidden),
          projects,
          activities,
        }, null, 2),
        {
          headers: {
            "content-type": "application/json; charset=utf-8",
            "cache-control": "public, max-age=300",
          },
        },
      )
    }

    const wantsPlain = format === "txt" || format === "plain"
    const wantsAnsi = format === "ansi" || isCliUserAgent(userAgent) || (accept.includes("text/plain") && !accept.includes("text/html"))

    if ((wantsAnsi || wantsPlain) && !pathname.includes(".")) {
      const body = renderAnsiPortfolio({
        profile,
        hero,
        stack,
        projects,
        activities,
        origin: url.origin,
        route: pathname,
        ansi: !wantsPlain,
      })
      return new Response(body, {
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "cache-control": "public, max-age=300",
          vary: "User-Agent, Accept",
        },
      })
    }

    return env.ASSETS.fetch(request)
  },
}
