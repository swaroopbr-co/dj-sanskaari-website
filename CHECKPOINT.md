# Project Checkpoint: v1.8 (Stable)
**Date:** 2025-12-07
**Status:** Production Ready

## Overview
This checkpoint marks the successful resolution of CMS connectivity, Vercel deployment, and frontend rendering issues. The website is now fully functional with dynamic content driven by Sanity CMS and a working Google Sheets booking integration.

## Key Features & Fixes
1.  **Sanity CMS Integration:**
    *   **Project ID:** `ipk33t5a` (Correctly authenticated)
    *   **Endpoints:** `/api/events`, `/api/mixes`, `/api/gallery`
    *   **Security:** Uses `SANITY_API_TOKEN` for secure server-side fetching.
    *   **Content:** Events, Mixes, and Gallery are fully dynamic.

2.  **Frontend Stability:**
    *   **Sequential Loading:** API requests are serialized (`await loadEvents` -> `await loadMixes` -> `await initGallery`) to prevent serverless function timeouts/race conditions.
    *   **Visibility:** CSS `opacity: 0` and complex `IntersectionObserver` logic were disabled to ensure content is always visible on load.
    *   **Gallery:** Fixed duplication bug and ensured correct data mapping.

3.  **Booking System:**
    *   **Google Sheets:** Connected via Service Account.
    *   **Private Key:** Robust parsing logic handles various formatting issues (newlines, quotes).
    *   **Endpoint:** `/api/submit` correctly appends rows to "Sheet1".

## Configuration
*   **Vercel Config:** `vercel.json` rewrites `/api/*` to `api/index.js`.
*   **Environment Variables:**
    *   `SANITY_API_TOKEN`
    *   `GOOGLE_PRIVATE_KEY`
    *   `GOOGLE_CLIENT_EMAIL`
    *   `SPREADSHEET_ID`

## Verification
*   **Debug Endpoint:** `https://dj-sanskaari-website.vercel.app/api/debug` (Use to check connectivity)
*   **Footer Marker:** "Powered By SBR.Co | v1.8" indicates this stable build.

## Maintenance
*   **Adding Content:** Use the Sanity Studio (`npx sanity dev` or deployed URL).
*   **Deploying:** Push to `main` branch triggers Vercel deployment.
