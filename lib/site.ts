/**
 * Where DataDraft lives: the site and the public repo. Their own tiny module
 * so client components can link out without bundling the project catalogue,
 * and so the next rename is one edit. The repo has to stay public: "Open in
 * Colab" opens notebooks only from a public repo.
 */
export const SITE_URL = "https://data-draft.vercel.app";
export const REPO = "jomckinney1999/datadraft";
export const REPO_URL = `https://github.com/${REPO}`;
