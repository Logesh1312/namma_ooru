# Deploying this site to GitHub Pages

This repository is ready to publish as a static site. The workflow `.github/workflows/deploy.yml` will push your repository contents to a `gh-pages` branch on every push to `main`.

Steps to enable automatic public hosting:

1. Commit and push the new workflow and any changes to the `main` branch:

```bash
git add .github/workflows/deploy.yml DEPLOY.md
git commit -m "Add GitHub Pages deploy workflow"
git push origin main
```

2. The Actions workflow will run and create/update a `gh-pages` branch with the site files.

3. Once the workflow completes, the site should be available at:

https://Logesh1312.github.io/namma_ooru/

If the site does not appear after the workflow finishes:
- Open the repository on GitHub → Settings → Pages.
- Ensure the source is set to the `gh-pages` branch (root) and save.

Notes:
- The workflow deploys the repository root. If you prefer to publish only a `docs/` folder, move site files into `docs/` and update the action `folder` or use GitHub Pages source `main` → `/docs`.
- GitHub may take a minute to publish after the branch is updated.

If you want, I can also:
- Change the workflow to publish only `docs/` instead of root.
- Add a small `index.html` redirect if you want a different landing path.
