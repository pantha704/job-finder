import type { Job } from "../types";
import { fetchRendered } from "../browser";
import { delay, checkRobotstxt, parseRelativeDate } from "../utils";
import * as cheerio from "cheerio";

/**
 * Scrape LinkedIn Jobs using auth cookie.
 * Requires --linkedin-cookie flag with a valid LinkedIn session cookie.
 */
export async function scrapeLinkedIn(cookie?: string): Promise<Job[]> {
  const jobs: Job[] = [];

  if (!cookie) {
    console.warn("[LinkedIn] Skipping — requires --linkedin-cookie for auth");
    return jobs;
  }

  const allowed = await checkRobotstxt("linkedin.com", "/jobs");
  if (!allowed) {
    console.warn("[LinkedIn] robots.txt blocked");
    return jobs;
  }

  const searchUrls = [
    "https://www.linkedin.com/jobs/search/?f_TPR=r604800&f_WT=2&geoId=102713980&keywords=rust%20developer",
    "https://www.linkedin.com/jobs/search/?f_TPR=r604800&f_WT=2&geoId=102713980&keywords=solana%20developer",
    "https://www.linkedin.com/jobs/search/?f_TPR=r604800&f_WT=2&geoId=102713980&keywords=typescript%20developer",
    "https://www.linkedin.com/jobs/search/?f_TPR=r604800&f_WT=2&geoId=102713980&keywords=web3%20developer",
  ];

  for (const url of searchUrls) {
    try {
      const { html } = await fetchRendered(url, {
        headers: { cookie },
      });

      const $ = cheerio.load(html);

      // LinkedIn job cards
      $(".base-card").each((_, el) => {
        const title = $(el).find(".base-search-card__title").text().trim();
        const company = $(el).find(".base-search-card__subtitle a").text().trim();
        const location = $(el).find(".job-search-card__location").text().trim();
        const applyUrl = $(el).find("a.base-card__full-link").attr("href") || "";
        const postedRaw = $(el).find("time").attr("datetime") || "";

        if (!title || !company) return;

        jobs.push({
          title,
          company,
          applyUrl: applyUrl.split("?")[0],
          location: location || "Remote",
          experience: "Entry level",
          salary: null,
          postedDate: postedRaw ? new Date(postedRaw) : null,
          techStack: [],
          source: "LinkedIn",
          isHighMatch: false,
        });
      });

      await delay(3000); // Rate limit
    } catch (err: any) {
      console.warn(`[LinkedIn] Error: ${err.message}`);
    }
  }

  console.log(`[LinkedIn] Total: ${jobs.length} jobs`);
  return jobs;
}
