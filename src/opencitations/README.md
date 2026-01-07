# OpenCitations MCP Server

An MCP (Model Context Protocol) server that provides access to the [OpenCitations](https://opencitations.net/) API. This allows LLMs to query citation data, find papers that cite a given work, and explore reference networks.

## Installation

```bash
npx @ahmeshaf/mcp-server-opencitations
```

Or install globally:

```bash
npm install -g @ahmeshaf/mcp-server-opencitations
```

## Configuration

### Access Token (Optional)

OpenCitations API works without authentication, but providing a token is encouraged:

```bash
# Via command line argument
npx @ahmeshaf/mcp-server-opencitations --token=YOUR_TOKEN

# Via environment variable
export OPENCITATIONS_ACCESS_TOKEN=YOUR_TOKEN
npx @ahmeshaf/mcp-server-opencitations
```

### Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "opencitations": {
      "command": "npx",
      "args": ["@ahmeshaf/mcp-server-opencitations"],
      "env": {
        "OPENCITATIONS_ACCESS_TOKEN": "your_token_here"
      }
    }
  }
}
```

## Tools

### citation_count

Get the number of papers that cite a given DOI.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `doi` | string | Yes | DOI of the paper (e.g., `10.1108/jd-12-2013-0166`) |

**Example:**
```
citation_count("10.1108/jd-12-2013-0166")
→ Citation count for 10.1108/jd-12-2013-0166: 38
```

### get_citations

Get all papers that cite a given DOI.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `doi` | string | Yes | DOI of the paper |

**Returns:** List of citing papers with OCI, citing DOI, cited DOI, date, and self-citation flags.

### reference_count

Get the number of references in a paper (papers it cites).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `doi` | string | Yes | DOI of the paper (e.g., `10.7717/peerj-cs.421`) |

**Example:**
```
reference_count("10.7717/peerj-cs.421")
→ Reference count for 10.7717/peerj-cs.421: 42
```

### get_references

Get all papers referenced by a given DOI.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `doi` | string | Yes | DOI of the paper |

**Returns:** List of referenced papers with OCI, citing DOI, cited DOI, date, and self-citation flags.

### get_citation

Get metadata for a specific citation link using its Open Citation Identifier (OCI).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `oci` | string | Yes | Open Citation Identifier (e.g., `06101801781-06180334099`) |

**Returns:** Citation metadata including citing paper, cited paper, date, timespan, and self-citation flags.

### venue_citation_count

Get the total number of citations for all papers published in a journal.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `issn` | string | Yes | ISSN of the journal (e.g., `0138-9130`) |

**Example:**
```
venue_citation_count("0138-9130")
→ Total citations for venue 0138-9130: 125000
```

## Supported Identifier Formats

| Type | Format | Example |
|------|--------|---------|
| DOI | `10.xxx/xxx` or `doi:10.xxx/xxx` | `10.1108/jd-12-2013-0166` |
| ISSN | `xxxx-xxxx` or `issn:xxxx-xxxx` | `0138-9130` |
| OCI | `xxx-xxx` | `06101801781-06180334099` |

DOI URLs are also accepted: `https://doi.org/10.1108/jd-12-2013-0166`

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run locally
node dist/index.js

# Test with MCP inspector
npx @modelcontextprotocol/inspector node dist/index.js
```

## API Reference

This server uses the [OpenCitations Index API v2](https://api.opencitations.net/index/v2).

## Repository

Source code: [github.com/ahmeshaf/servers/src/opencitations](https://github.com/ahmeshaf/servers/tree/main/src/opencitations)

## License

MIT
