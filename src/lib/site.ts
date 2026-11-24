/**
 * Public site settings. Override with env vars when you deploy your own copy
 * (e.g. a fork): NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_REPO_URL.
 */
export const SITE_NAME = "PickUI";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickui.guetix.com").replace(/\/+$/, "");
export const REPO_URL = process.env.NEXT_PUBLIC_REPO_URL ?? "https://github.com/hamza-guetioui/pickui";
export const AUTHOR = { name: "Hamza Guetioui", url: "https://guetix.com" };
