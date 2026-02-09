# Deployment Guide to Vercel

This guide outlines the steps to deploy your School Management System to Vercel.

## 1. Prepare MongoDB Atlas (Critical Step)
Vercel uses dynamic IP addresses, so you must allow connections from anywhere for your database to work.

1.  Log in to your [MongoDB Atlas Dashboard](https://cloud.mongodb.com/).
2.  Go to **Network Access** under the Security tab.
3.  Click **+ Add IP Address**.
4.  Select **Allow Access from Anywhere** (adds `   `).
5.  Click **Confirm**.
    *   *Note: This also fixes the local connection error you saw earlier.*

## 2. Push Code to GitHub
Ensure your local code is committed and pushed to your repository.

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

## 3. Deploy on Vercel
1.  Log in to [Vercel](https://vercel.com/).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository (`school-management` or whatever you named it).
4.  **Configure Project**:
    *   **Framework Preset**: Next.js (should be auto-detected).
    *   **Root Directory**: `./` (default).

5.  **Environment Variables**:
    You MUST add the following variables in the Vercel dashboard before clicking Deploy.

    | Variable Name     | Value                                                              |
    | :---------------- | :----------------------------------------------------------------- |
    | `MONGODB_URI`     | Your connection string from `.env.local`                           |
    | `NEXTAUTH_SECRET` | A long random string (e.g., generated via `openssl rand -base64 32`) |
    | `NEXTAUTH_URL`    | Your Vercel domain (e.g., `https://your-project.vercel.app`)       |

    *   *Tip: For the initial deployment, you can set `NEXTAUTH_URL` later once you know the generated domain, or set it to `http://localhost:3000` temporarily if just testing building.*
    *   *Better: Vercel automatically sets `VERCEL_URL`, but NextAuth.js expects `NEXTAUTH_URL`. Vercel deployments work best if you set the canonical URL.*

6.  Click **Deploy**.

## 4. Post-Deployment Checks
1.  Visit your new Vercel URL.
2.  Try logging in.
3.  Check the **Logs** tab in Vercel if you encounter any 500 errors.

## Troubleshooting
-   **MongoDB Connection Error**: Double-check Step 1 (Network Access).
-   **404 on API Routes**: Ensure your file structure in `src/app/api` is correct.
-   **Build Failures**: Check the "Build Logs" in Vercel for TypeScript errors (we fixed most of them locally).
-   **Git Push Errors (Permission Denied)**:
    -   If you see `Permission to ... denied to ...`, it means you are logged into a GitHub account that does not own the repository you are pushing to.
    -   **Solution 1 (Change Repo)**: Create a new repository on *your* GitHub account, then point `origin` to it:
        ```bash
        git remote set-url origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git
        git push -u origin main
        ```
    -   **Solution 2 (Authenticate)**: If the repo belongs to you but under a different username, ensure you are logged in correctly using [GitHub CLI](https://cli.github.com/) (`gh auth login`) or a [Personal Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens).
