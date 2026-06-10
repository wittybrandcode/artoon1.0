# ARTOON Security Guide

## 1. PRINCIPLES
- **Egress Sanitization:** All data is untrusted until rendered.
- **Protocol Whitelisting:** Strict checks on URIs.
- **Attribute Hardening:** Automated injection of security attributes.

## 2. URL SANITIZATION
All URLs must pass through the `sanitizeUrl` utility:
1. Parse using `new URL()`.
2. Verify protocol is in `['https:', 'http:', 'mailto:', 'tel:', 'blob:', 'data:']`.
3. For `data:` URIs, verify mime-type is safe (e.g., `image/png`).

## 3. LINK SAFETY
All links rendered with `target="_blank"` MUST include `rel="noopener noreferrer"` to prevent Reverse Tabnabbing.

## 4. INJECTION PREVENTION
- All text content must be HTML-escaped using the unified `escapeHtml` utility from `@artoon/core`.
- Custom block properties must be validated against their schema to prevent prototype pollution.
