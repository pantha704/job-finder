export const extractSkillsFromGitHub = async (username: string): Promise<string[]> => {
  // Skeleton implementation for github extraction.
  // In a real app, you would hit the GitHub API to analyze user repositories.
  try {
    const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`);
    if (!res.ok) return [];
    
    const repos = await res.json();
    const languages = new Set<string>();
    
    if (Array.isArray(repos)) {
      for (const repo of repos) {
        if (repo.language) {
          languages.add(repo.language.toLowerCase());
        }
      }
    }
    
    return Array.from(languages);
  } catch (err) {
    return [];
  }
};
