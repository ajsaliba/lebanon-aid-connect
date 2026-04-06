# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |

Only the latest version on the `main` branch is actively maintained and receives security updates.

## Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability in Cedars Alert, please report it responsibly:

1. **GitHub Private Vulnerability Reporting**: Use <a href="https://github.com/ajsaliba/Cedars-Alert/security/advisories/new">GitHub's private vulnerability reporting</a> to submit your report directly through the repository.

2. **Direct Contact**: Alternatively, reach out to the repository owner <a href="https://github.com/ajsaliba">@ajsaliba</a> directly through GitHub.

### What to Include

- A description of the vulnerability and its potential impact
- Steps to reproduce the issue
- Affected components (frontend, edge functions, data layers, etc.)
- Any potential fixes or mitigations you've identified

### Response Timeline

- **Acknowledgment**: Within 48 hours of your report
- **Initial Assessment**: Within 1 week
- **Fix/Patch**: Depending on severity, critical issues will be prioritized

### What to Expect

- You will receive an acknowledgment of your report
- We will work with you to understand and validate the issue
- We will keep you informed of progress toward a fix
- Credit will be given to reporters in the fix commit (unless you prefer anonymity)

## Security Considerations

Cedars Alert is a client-side intelligence and humanitarian coordination dashboard that aggregates publicly available data. Here are the key security areas:

### API Keys & Secrets

- API keys and secrets should never be committed to the repository
- Use environment variables for sensitive configuration (`.env` / `.env.local`)
- Keep Supabase service-role and third-party API credentials server-side only

### Edge Functions

- Supabase Edge Functions should validate and sanitize all input
- Apply strict CORS and origin controls where applicable
- Protect function endpoints against abuse (for example via rate limiting and input validation)

### Client-Side Security

- Do not store sensitive secrets in browser storage
- Sanitize external content before rendering to prevent XSS
- Prefer trusted and vetted data sources for map and intelligence layers

### Data Sources

- Cedars Alert aggregates publicly available OSINT and humanitarian data
- Data is consumed in read-oriented workflows and should not modify upstream sources

## Scope

The following are **in scope** for security reports:

- Vulnerabilities in the Cedars Alert codebase
- Edge function security issues (SSRF, injection, auth bypass)
- XSS or content injection through RSS feeds or external data
- API key exposure or secret leakage
- Dependency vulnerabilities with a viable attack vector

The following are **out of scope**:

- Vulnerabilities in third-party services we consume (report to the upstream provider)
- Social engineering attacks
- Denial of service attacks
- Issues in forked copies of the repository
- Security issues in user-provided environment configurations

## Best Practices for Contributors

- Never commit API keys, tokens, or secrets
- Use environment variables for all sensitive configuration
- Sanitize external input in edge functions
- Keep dependencies updated and review vulnerability advisories regularly
- Follow the principle of least privilege for API access

---

Thank you for helping keep Cedars Alert and its users safe! 🔒
