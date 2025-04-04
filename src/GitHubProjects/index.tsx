// src/GitHubProjects/index.tsx
import React, { useState, useEffect } from 'react';
import { Octokit } from '@octokit/core';

// Типы для репозиториев
interface GitHubRepo {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  updated_at: string;
  language: string | null;
  stargazers_count: number;
}

const GitHubProjects: React.FC = () => {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [username, setUsername] = useState<string>('Michail19');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;

    const octokit = new Octokit();
    //const octokit = new Octokit({
    //  auth: process.env.REACT_APP_GITHUB_TOKEN // Опционально для приватных репозиториев
    //});

    const fetchRepos = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await octokit.request('GET /users/{username}/repos', {
          username,
          sort: 'updated',
          per_page: 100
        });

        setRepos(response.data as GitHubRepo[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, []);

  return (
    <div className="worksheet">
      {loading && <div className="loader">Loading...</div>}
      
      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}

      <div className="repos-grid">
        {repos.map((repo) => (
          <div key={repo.id} className="repo-card">
            <a 
              href={repo.html_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="repo-link"
            >
              <h3>{repo.name}</h3>
            </a>
            {repo.description && <p>{repo.description}</p>}
            <div className="repo-meta">
              {repo.language && <span>{repo.language}</span>}
              <span>⭐ {repo.stargazers_count}</span>
              <span>Updated: {new Date(repo.updated_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GitHubProjects;