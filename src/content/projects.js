/**
 * Your projects, in display order. Add an object to this array and it appears in
 * the list, the grid, and gets its own page at /projects/<slug>.
 *
 * Fields:
 *   slug         Used in the URL: /projects/<slug>. Lowercase, no spaces.
 *   name         Project name.
 *   tagline      One-line summary shown in the list, cards, and page header.
 *   year         e.g. "2026"
 *   status       "shipped", "in-progress", or "archived"
 *   category     Free text. Filter buttons are generated from the categories you use.
 *   stack        List of technologies.
 *   description  Paragraphs for the Overview section on the detail page.
 *   highlights   Bullet points for the Features section on the detail page.
 *   links        Buttons on the detail page, e.g. { label: "Source", href: "https://..." }.
 *                The first one is highlighted. Use [] for none.
 *   diagram      Plain-ASCII architecture diagram. Stick to + - | > < ^ v so columns line up.
 */
export const projects = [
  {
    slug: "ledgerline",
    name: "ledgerline",
    tagline: "Split rent, groceries, and bills with roommates, without the shared spreadsheet.",
    year: "2026",
    status: "shipped",
    category: "fullstack",
    stack: ["Next.js", "TypeScript", "PostgreSQL", "Drizzle"],
    description: [
      "ledgerline started because my apartment's expense spreadsheet had three competing formulas and nobody trusted the totals. It records every expense as a double-entry ledger row, so balances are always derived from history instead of edited by hand.",
      "The settle-up screen runs a minimum cash flow algorithm to turn a messy web of debts into the fewest possible payments. Six people use it every month, which is about five more users than most of my projects.",
    ],
    highlights: [
      "Double-entry ledger schema, so balances can always be recomputed and audited",
      "Settle-up suggests the minimum number of transfers between people",
      "Optimistic UI with server actions, works fine on bad dorm Wi-Fi",
      "Recurring expenses scheduled with a cron job",
    ],
    links: [
      { label: "Live app", href: "https://example.com/" },
      { label: "Source", href: "https://github.com/" },
    ],
    diagram: `+-----------+     +-------------+     +--------------+
|  next.js  |---->|   server    |---->|   postgres   |
|  (react)  |<----|   actions   |<----|  ledger rows |
+-----------+     +------+------+     +--------------+
                         |
                         v
                  +--------------+
                  |  settle-up   |
                  |  min cash    |
                  |  flow solver |
                  +--------------+`,
  },
  {
    slug: "lecture-rag",
    name: "lecture-rag",
    tagline: "Ask questions about your course lectures and get answers with slide citations.",
    year: "2026",
    status: "in-progress",
    category: "ml",
    stack: ["Python", "FastAPI", "pgvector", "React"],
    description: [
      "lecture-rag ingests slide decks and lecture transcripts, chunks them by heading, and stores embeddings in Postgres with pgvector. A question gets embedded, matched against the top chunks, and passed to an LLM that must cite the slides it used.",
      "Most of my time has gone into evaluation rather than features. I built a small set of 120 real student questions with reference answers, and every retrieval change gets scored against it before it ships.",
    ],
    highlights: [
      "Heading-aware chunking that keeps slide titles with their content",
      "Hybrid search: BM25 plus vector similarity, reranked",
      "Every answer links back to the exact slide and timestamp",
      "Eval harness tracks retrieval recall and answer faithfulness per commit",
    ],
    links: [{ label: "Source", href: "https://github.com/" }],
    diagram: `slides/pdf --> chunker --> embed --> [ pgvector ]
                                         |
question ----> embed ----> top-k <-------+
                             |
                             v
                   +-------------------+
                   |  llm + citations  |----> answer
                   +-------------------+`,
  },
  {
    slug: "tinykv",
    name: "tinykv",
    tagline: "A distributed key-value store built on my own Raft implementation.",
    year: "2026",
    status: "in-progress",
    category: "backend",
    stack: ["Go", "gRPC", "Raft"],
    description: [
      "tinykv started as a distributed systems course project and kept growing. Each node runs a Raft state machine that handles leader election, log replication, and snapshotting, with a small KV store layered on top.",
      "Most of the work went into testing. A fault-injection harness partitions the network, drops packets, and restarts nodes at random while a linearizability checker verifies the history afterwards.",
    ],
    highlights: [
      "Leader election, log replication, and log compaction via snapshots",
      "Chaos test harness with network partitions and crash-restart",
      "History verified with a Porcupine-style linearizability checker",
    ],
    links: [{ label: "Source", href: "https://github.com/" }],
    diagram: `          +----------+
client -->|  leader  |
          +----+-----+
         +-----+-----+
         v           v
   +----------+ +----------+
   | follower | | follower |
   +----------+ +----------+`,
  },
  {
    slug: "gatekeeper",
    name: "gatekeeper",
    tagline: "A drop-in rate limiting sidecar with token buckets stored in Redis.",
    year: "2025",
    status: "shipped",
    category: "backend",
    stack: ["Go", "Redis", "Lua", "Docker"],
    description: [
      "gatekeeper sits in front of any HTTP service and enforces per-key rate limits. The token bucket logic runs as a single Lua script inside Redis, so checks stay atomic even with many gatekeeper replicas running.",
      "I wrote it after a side project got hammered by a scraper. It now protects the hackathon registration API every year.",
    ],
    highlights: [
      "Atomic token bucket in one Redis round trip via EVALSHA",
      "Limits configured per route and per API key in YAML, hot-reloaded",
      "p99 overhead under 2 ms in load tests at 5k requests per second",
      "Prometheus metrics for allowed and rejected requests",
    ],
    links: [{ label: "Source", href: "https://github.com/" }],
    diagram: `request --> [ gatekeeper ] --allow--> upstream
                  |    |
                  |    +--deny--> 429
                  v
        EVALSHA token_bucket.lua
                  |
                  v
             +---------+
             |  redis  |
             +---------+`,
  },
  {
    slug: "minigrad",
    name: "minigrad",
    tagline: "A tiny autograd engine and neural net library, built to actually understand backprop.",
    year: "2025",
    status: "shipped",
    category: "ml",
    stack: ["Python", "NumPy"],
    description: [
      "minigrad builds a computation graph as you do math on tensors, then walks it in reverse topological order to compute gradients. On top of that sits a small layer API, an SGD and Adam optimizer, and a training loop.",
      "It trains a two-layer MLP on MNIST to 97% test accuracy. It is slow, but every number in it is one I can explain.",
    ],
    highlights: [
      "Reverse-mode autodiff over a dynamic computation graph",
      "Gradients checked against finite differences in the test suite",
      "Linear, ReLU, softmax cross-entropy, SGD, and Adam implemented from scratch",
    ],
    links: [
      { label: "Source", href: "https://github.com/" },
      { label: "Write-up", href: "https://example.com/" },
    ],
    diagram: `x ---+
     (*)--> a ---+
w ---+           (+)--> z --> relu --> loss
            b ---+

<----------------- backward() -----------------`,
  },
  {
    slug: "syllabus-cli",
    name: "syllabus-cli",
    tagline: "A CLI that turns syllabus PDFs into calendar events.",
    year: "2024",
    status: "archived",
    category: "tools",
    stack: ["Python", "Typer", "LLM APIs"],
    description: [
      "Every semester I spent an evening copying due dates from syllabi into my calendar. syllabus-cli extracts the text, asks an LLM for structured JSON against a strict schema, validates the dates, and writes an .ics file.",
      "It is archived because my university now publishes deadlines in the course portal, which is the best possible way for a project to die.",
    ],
    highlights: [
      "Structured output validated with Pydantic before anything is written",
      "Flags low-confidence dates for manual review instead of guessing",
    ],
    links: [{ label: "Source", href: "https://github.com/" }],
    diagram: `syllabus.pdf --> extract text --> llm (json schema)
                                          |
                                          v
                                 validate dates --> .ics`,
  },
]
