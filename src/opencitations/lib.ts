// =============================================================================
// OpenCitations API Client
// =============================================================================

const BASE_URL = "https://api.opencitations.net/index/v2";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface Citation {
  oci: string;
  citing: string;
  cited: string;
  creation: string;      // ISO 8601 date
  timespan: string;      // XSD duration
  journal_sc: string;    // "yes" or "no" - journal self-citation
  author_sc: string;     // "yes" or "no" - author self-citation
}

export interface CitationCount {
  count: string;  // API returns as string
}

// -----------------------------------------------------------------------------
// API Client
// -----------------------------------------------------------------------------

/**
 * Makes a request to the OpenCitations API
 *
 * @param endpoint - API endpoint (e.g., "/citations/doi:10.1234/example")
 * @param accessToken - Optional access token for authentication
 * @returns Promise with the JSON response
 */
async function apiRequest<T>(endpoint: string, accessToken?: string): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    "Accept": "application/json",
  };

  // Add authorization header if token is provided
  if (accessToken) {
    headers["Authorization"] = accessToken;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

// -----------------------------------------------------------------------------
// Public Functions
// -----------------------------------------------------------------------------

/**
 * Get the count of citations for a given identifier
 *
 * @param id - Identifier with prefix (e.g., "doi:10.1108/jd-12-2013-0166")
 * @param accessToken - Optional access token
 * @returns Number of citations
 */
export async function getCitationCount(id: string, accessToken?: string): Promise<number> {
  const data = await apiRequest<CitationCount[]>(`/citation-count/${id}`, accessToken);

  if (data.length === 0) {
    return 0;
  }

  return parseInt(data[0].count, 10);
}

/**
 * Get all citations (papers that cite the given identifier)
 *
 * @param id - Identifier with prefix (e.g., "doi:10.1108/jd-12-2013-0166")
 * @param accessToken - Optional access token
 * @returns Array of Citation objects
 */
export async function getCitations(id: string, accessToken?: string): Promise<Citation[]> {
  return apiRequest<Citation[]>(`/citations/${id}`, accessToken);
}

/**
 * Get the count of references for a given identifier
 *
 * @param id - Identifier with prefix (e.g., "doi:10.7717/peerj-cs.421")
 * @param accessToken - Optional access token
 * @returns Number of references
 */
export async function getReferenceCount(id: string, accessToken?: string): Promise<number> {
  const data = await apiRequest<CitationCount[]>(`/reference-count/${id}`, accessToken);

  if (data.length === 0) {
    return 0;
  }

  return parseInt(data[0].count, 10);
}

/**
 * Get all references (papers cited by the given identifier)
 *
 * @param id - Identifier with prefix (e.g., "doi:10.7717/peerj-cs.421")
 * @param accessToken - Optional access token
 * @returns Array of Citation objects
 */
export async function getReferences(id: string, accessToken?: string): Promise<Citation[]> {
  return apiRequest<Citation[]>(`/references/${id}`, accessToken);
}

/**
 * Get metadata for a specific citation by OCI
 *
 * @param oci - Open Citation Identifier (e.g., "06101801781-06180334099")
 * @param accessToken - Optional access token
 * @returns Citation metadata
 */
export async function getCitation(oci: string, accessToken?: string): Promise<Citation | null> {
  const data = await apiRequest<Citation[]>(`/citation/${oci}`, accessToken);
  return data.length > 0 ? data[0] : null;
}

/**
 * Get the total citation count for all papers in a venue (journal)
 *
 * @param issn - ISSN of the venue (e.g., "issn:0138-9130")
 * @param accessToken - Optional access token
 * @returns Total citation count for the venue
 */
export async function getVenueCitationCount(issn: string, accessToken?: string): Promise<number> {
  const data = await apiRequest<CitationCount[]>(`/venue-citation-count/${issn}`, accessToken);

  if (data.length === 0) {
    return 0;
  }

  return parseInt(data[0].count, 10);
}

// -----------------------------------------------------------------------------
// Utility Functions
// -----------------------------------------------------------------------------

/**
 * Format a DOI into the API's expected format
 * Handles both raw DOIs and prefixed DOIs
 */
export function formatDoi(doi: string): string {
  // Remove URL prefix if present
  doi = doi.replace(/^https?:\/\/doi\.org\//, "");

  // Add "doi:" prefix if not present
  if (!doi.startsWith("doi:")) {
    return `doi:${doi}`;
  }

  return doi;
}

/**
 * Format an ISSN into the API's expected format
 */
export function formatIssn(issn: string): string {
  // Add "issn:" prefix if not present
  if (!issn.startsWith("issn:")) {
    return `issn:${issn}`;
  }
  return issn;
}

/**
 * Format a single Citation into a readable string
 */
export function formatCitationAsText(citation: Citation): string {
  const lines = [
    `OCI: ${citation.oci}`,
    `Citing: ${citation.citing}`,
    `Cited: ${citation.cited}`,
    `Date: ${citation.creation || "N/A"}`,
    `Timespan: ${citation.timespan || "N/A"}`,
    `Journal self-citation: ${citation.journal_sc || "no"}`,
    `Author self-citation: ${citation.author_sc || "no"}`,
  ];
  return lines.join("\n");
}

/**
 * Format citations into a readable string
 */
export function formatCitationsAsText(citations: Citation[]): string {
  if (citations.length === 0) {
    return "No citations found.";
  }

  return citations.map((c, i) => {
    const lines = [
      `[${i + 1}] OCI: ${c.oci}`,
      `    Citing: ${c.citing}`,
      `    Cited: ${c.cited}`,
      `    Date: ${c.creation || "N/A"}`,
    ];

    if (c.journal_sc === "yes") lines.push("    (Journal self-citation)");
    if (c.author_sc === "yes") lines.push("    (Author self-citation)");

    return lines.join("\n");
  }).join("\n\n");
}
