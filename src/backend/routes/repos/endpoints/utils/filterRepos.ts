interface Repo {
  name: string;
  slug: string;
  cloneUrl: string;
}

export const filterRepos = (repos: Repo[]) => {
  const RELEVANT_REPO_NAMES = [
    "docket",
    "docket-customer-portal",
    "docket-mobile",
    "docket-forms",
    "docket-survcart-app",
    "docket-embed",
    "docket-admin",
    "docket-platform",
  ];
  return repos.filter((repo) => RELEVANT_REPO_NAMES.includes(repo.name));
};
