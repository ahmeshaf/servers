#!/usr/bin/env node

// =============================================================================
// OpenCitations MCP Server
// =============================================================================

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Import API client functions from lib.ts
import {
  getCitation,
  getCitationCount,
  getCitations,
  getReferenceCount,
  getReferences,
  getVenueCitationCount,
  formatDoi,
  formatIssn,
  formatCitationAsText,
  formatCitationsAsText,
} from "./lib.js";

// -----------------------------------------------------------------------------
// CONFIGURATION
// -----------------------------------------------------------------------------

function getAccessToken(): string | undefined {
  const tokenArg = process.argv.find(arg => arg.startsWith('--token='));
  if (tokenArg) {
    return tokenArg.split('=')[1];
  }
  return process.env.OPENCITATIONS_ACCESS_TOKEN;
}

const ACCESS_TOKEN = getAccessToken();

if (!ACCESS_TOKEN) {
  console.error("Warning: No access token set (optional but recommended)");
  console.error("  Use: --token=YOUR_TOKEN");
  console.error("  Or set OPENCITATIONS_ACCESS_TOKEN environment variable");
}

// -----------------------------------------------------------------------------
// SERVER SETUP
// -----------------------------------------------------------------------------

const server = new McpServer({
  name: "opencitations-server",
  version: "0.2.0",
});

// -----------------------------------------------------------------------------
// TOOLS
// -----------------------------------------------------------------------------

// Tool: Get citation count
server.registerTool(
  "citation_count",
  {
    description:
      "Get the number of citations for a paper (how many papers cite it). " +
      "Provide a DOI like '10.1108/jd-12-2013-0166' or 'doi:10.1108/jd-12-2013-0166'.",
    inputSchema: {
      doi: z.string().describe("DOI of the paper (e.g., '10.1108/jd-12-2013-0166')"),
    },
  },
  async (args) => {
    const id = formatDoi(args.doi);
    const count = await getCitationCount(id, ACCESS_TOKEN);

    return {
      content: [{
        type: "text" as const,
        text: `Citation count for ${args.doi}: ${count}`,
      }],
    };
  }
);

// Tool: Get citations (papers that cite this paper)
server.registerTool(
  "get_citations",
  {
    description:
      "Get all papers that cite a given paper. " +
      "Returns a list of citing papers with their DOIs and metadata. " +
      "Provide a DOI like '10.1108/jd-12-2013-0166'.",
    inputSchema: {
      doi: z.string().describe("DOI of the paper to find citations for"),
    },
  },
  async (args) => {
    const id = formatDoi(args.doi);
    const citations = await getCitations(id, ACCESS_TOKEN);

    const text = citations.length > 0
      ? `Found ${citations.length} citations for ${args.doi}:\n\n${formatCitationsAsText(citations)}`
      : `No citations found for ${args.doi}`;

    return {
      content: [{ type: "text" as const, text }],
    };
  }
);

// Tool: Get reference count
server.registerTool(
  "reference_count",
  {
    description:
      "Get the number of references in a paper (how many papers it cites). " +
      "Provide a DOI like '10.7717/peerj-cs.421'.",
    inputSchema: {
      doi: z.string().describe("DOI of the paper (e.g., '10.7717/peerj-cs.421')"),
    },
  },
  async (args) => {
    const id = formatDoi(args.doi);
    const count = await getReferenceCount(id, ACCESS_TOKEN);

    return {
      content: [{
        type: "text" as const,
        text: `Reference count for ${args.doi}: ${count}`,
      }],
    };
  }
);

// Tool: Get references (papers this paper cites)
server.registerTool(
  "get_references",
  {
    description:
      "Get all papers referenced by a given paper. " +
      "Returns a list of referenced papers with their DOIs and metadata. " +
      "Provide a DOI like '10.7717/peerj-cs.421'.",
    inputSchema: {
      doi: z.string().describe("DOI of the paper to find references for"),
    },
  },
  async (args) => {
    const id = formatDoi(args.doi);
    const references = await getReferences(id, ACCESS_TOKEN);

    const text = references.length > 0
      ? `Found ${references.length} references in ${args.doi}:\n\n${formatCitationsAsText(references)}`
      : `No references found for ${args.doi}`;

    return {
      content: [{ type: "text" as const, text }],
    };
  }
);

// Tool: Get single citation by OCI
server.registerTool(
  "get_citation",
  {
    description:
      "Get metadata for a specific citation using its Open Citation Identifier (OCI). " +
      "An OCI is a unique identifier for a citation link between two papers. " +
      "Example OCI: '06101801781-06180334099'.",
    inputSchema: {
      oci: z.string().describe("Open Citation Identifier (e.g., '06101801781-06180334099')"),
    },
  },
  async (args) => {
    // Remove 'oci:' prefix if present
    const oci = args.oci.replace(/^oci:/, "");
    const citation = await getCitation(oci, ACCESS_TOKEN);

    if (!citation) {
      return {
        content: [{ type: "text" as const, text: `No citation found for OCI: ${args.oci}` }],
      };
    }

    return {
      content: [{ type: "text" as const, text: formatCitationAsText(citation) }],
    };
  }
);

// Tool: Get venue citation count
server.registerTool(
  "venue_citation_count",
  {
    description:
      "Get the total number of citations for all papers published in a journal/venue. " +
      "Provide an ISSN like '0138-9130' or 'issn:0138-9130'.",
    inputSchema: {
      issn: z.string().describe("ISSN of the journal (e.g., '0138-9130')"),
    },
  },
  async (args) => {
    const id = formatIssn(args.issn);
    const count = await getVenueCitationCount(id, ACCESS_TOKEN);

    return {
      content: [{
        type: "text" as const,
        text: `Total citations for venue ${args.issn}: ${count}`,
      }],
    };
  }
);

// -----------------------------------------------------------------------------
// START SERVER
// -----------------------------------------------------------------------------

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("OpenCitations MCP Server running on stdio");
}

main().catch((error: unknown) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
