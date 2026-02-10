import React, { useState, useEffect } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  OutlinedInput,
  type SelectChangeEvent,
} from "@mui/material";
import type { RepoOption } from "../../../../types";
import { StyledRepoSelectorContainer } from "./RepoSelector.styles";

interface RepoSelectorProps {
  selectedRepos: RepoOption[];
  onChange: (repos: RepoOption[]) => void;
  disabled?: boolean;
}

export const RepoSelector: React.FC<RepoSelectorProps> = ({
  selectedRepos,
  onChange,
  disabled = false,
}) => {
  const [repos, setRepos] = useState<RepoOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/repos");
        if (response.ok) {
          const data = (await response.json()) as { repos: RepoOption[] };
          setRepos(data.repos);
        }
      } catch (err) {
        console.error("Failed to fetch repos:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRepos();
  }, []);

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const selectedSlugs = event.target.value as string[];
    const selected = repos.filter((r) => selectedSlugs.includes(r.slug));
    onChange(selected);
  };

  const handleRemoveRepo = (slug: string) => {
    onChange(selectedRepos.filter((r) => r.slug !== slug));
  };

  return (
    <StyledRepoSelectorContainer>
      <FormControl fullWidth disabled={disabled || isLoading}>
        <InputLabel id="repo-select-label">Select Repositories</InputLabel>
        <Select
          labelId="repo-select-label"
          id="repo-select"
          multiple
          value={selectedRepos.map((r) => r.slug)}
          onChange={handleChange}
          input={<OutlinedInput label="Select Repositories" />}
          renderValue={(selected) => (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {(selected as string[]).map((slug) => {
                const repo = repos.find((r) => r.slug === slug);
                return (
                  <Chip
                    key={slug}
                    label={repo?.name || slug}
                    size="small"
                    onDelete={() => handleRemoveRepo(repo?.slug ?? slug)}
                    onMouseDown={(e) => e.stopPropagation()}
                  />
                );
              })}
            </Box>
          )}
        >
          {repos.map((repo) => (
            <MenuItem key={repo.slug} value={repo.slug}>
              {repo.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </StyledRepoSelectorContainer>
  );
};
