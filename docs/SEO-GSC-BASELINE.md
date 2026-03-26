# Google Search Console baseline — Shahada.org

This document records **automated checks** that do not require Search Console access, plus a **checklist** for you to complete inside [Google Search Console](https://search.google.com/search-console).

## Automated checks (completed)

| Check | Result | When |
|--------|--------|------|
| `GET https://shahada.org/en/` | `200 OK`, `text/html; charset=utf-8` | 2026-03-26 |
| `GET https://shahada.org/nl/` | `200 OK`, `text/html; charset=utf-8` | 2026-03-26 |
| `robots.txt` | Allows `/`, declares `Sitemap: https://shahada.org/sitemap.xml` | Repo |
| Live sitemap | `https://shahada.org/sitemap.xml` (submit/validate in GSC) | — |

**Note:** Whether Google has **indexed** a URL and how it **ranks** is only visible in Search Console (or by running a `site:shahada.org` search on Google, which is a rough signal).

## GSC checklist (fill in after you log in)

Copy this table into your own notes and update it after each review.

| Step | Action | Your notes |
|------|--------|------------|
| 1 | Property `shahada.org` verified | |
| 2 | **URL Inspection** → `https://shahada.org/en/` → confirm “URL is on Google” or note status | |
| 3 | **URL Inspection** → `https://shahada.org/nl/` → same | |
| 4 | **URL Inspection** → `https://shahada.org/en/about.html` → request indexing after first deploy | |
| 5 | **Performance** → filter queries containing: `shahada`, `convert`, `islam`, `moslim`, `bekeren` | |
| 6 | **Performance** → segment by **Country** (NL vs US/UK) for Dutch vs English intent | |
| 7 | **Links** → **External links** → note top linking sites and linked pages | |
| 8 | **Pages** (or legacy Coverage) → note indexed vs excluded counts | |
| 9 | **Sitemaps** → `https://shahada.org/sitemap.xml` submitted, no critical errors | |

## Interpreting common statuses

- **Crawled — currently not indexed:** Often needs stronger relevance, differentiation, or trust (not only more backlinks). Compare your page to what already ranks for the same query.
- **Discovered — currently not indexed:** Crawl queue or quality signals; ensure internal links and sitemap point to the URL.
- **Alternate page with proper canonical tag:** Expected for URLs that canonicalize elsewhere.

## Related internal docs

- [SEO outreach prospects](SEO-OUTREACH-PROSPECTS.md) — link-building targets and pitch.
- [SEO quarterly review](SEO-QUARTERLY-REVIEW.md) — recurring maintenance.
