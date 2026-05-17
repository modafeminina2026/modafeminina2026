Always use the MCP shadcn to search for components before creating a new component.
Always use the Context7 MCP because the Context7 MCP pulls up-to-date, version-specific documentation and code examples directly from the source.

The Context7 MCP provides the following tools that LLMs can use:

resolve-library-id: Resolves a general library name into a Context7-compatible ID.

query (required): The user's question or task (for relevance ranking)
libraryName (required): The name of the library to be searched
query-docs: Searches documentation for a library using a Context7-compatible ID.

libraryId (required): Exact Context7-compatible ID (e.g., /mongodb/docs, /vercel/next.js)
query (required): The question or task to obtain relevant documentation