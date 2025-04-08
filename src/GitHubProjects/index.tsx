import React, {useState, useEffect, useRef, useMemo} from 'react';
import { Octokit } from '@octokit/core';
import ReactDOM from "react-dom";
import {translations} from "../Worksheet/translations";
import {Language} from "../Worksheet/types";

interface GitHubRepo {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  updated_at: string;
  language: string | null;
  stargazers_count: number;
  employees?: {
    id: number;
    fio: string;
  }[];
}

interface MergedProject extends GitHubRepo {
  employees: {
    id: number;
    fio: string;
  }[];
}

const GitHubProjects: React.FC = () => {
  const [repos, setRepos] = useState<MergedProject[]>([]);
  const [username] = useState<string>('Michail19');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<MergedProject | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [language, setLanguage] = useState<Language>("ru");
  const currentTranslation = translations[language] ?? translations["ru"];

  useEffect(() => {
    const fetchData = async () => {
      const octokit = new Octokit();
      const jsonPath =
          process.env.NODE_ENV === "production"
              ? "https://raw.githubusercontent.com/Michail19/SimpleSheduleWork/refs/heads/master/public/data/data_example_projects.json"
              : "/data/data_example_projects.json";

      try {
        const [repoResponse, employeesResponse] = await Promise.all([
          octokit.request('GET /users/{username}/repos', {
            username: 'Michail19',
            sort: 'updated',
            per_page: 100,
          }),
          fetch(jsonPath),
        ]);

        const gitRepos = repoResponse.data as GitHubRepo[];
        const employeeData = await employeesResponse.json();
        const projects = employeeData?.projects ?? {};

        const filteredRepos = gitRepos.filter(
            (repo) =>
                repo.name.toLowerCase() !== username.toLowerCase() &&
                repo.name.toLowerCase() !== 'readme'
        );

        const merged = filteredRepos.map((repo) => {
          const matchedEmployees = projects[repo.name] || []; // название из GitHub должно совпадать
          return {
            ...repo,
            employees: matchedEmployees,
          };
        });

        setRepos(merged); // теперь в repos хранятся не просто репы, а репы + сотрудники
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Рассчитываем количество строк, которые умещаются в контейнер
  useEffect(() => {
    if (loading || repos.length === 0) return; // Не рассчитываем при загрузке или пустых данных

    const calculateRowsPerPage = () => {
      if (!containerRef.current) return;

      const viewportHeight = window.innerHeight; // Высота всего окна браузера
      const headerHeight = document.querySelector(".header")?.clientHeight || 0; // Высота заголовка
      const dateSwitcherHeight = document.querySelector(".subtitle")?.clientHeight || 0;
      const paginationHeight = document.querySelector(".footer")?.clientHeight || 0;
      const otherElementsHeight = 110; // Если есть отступы, доп. элементы

      const availableHeight = viewportHeight - headerHeight - dateSwitcherHeight - paginationHeight - otherElementsHeight;
      const rowHeight = document.querySelector(".repo-card")?.clientHeight || 20;

      const newRowsPerPage = Math.floor(availableHeight / rowHeight) || 10;

      setRowsPerPage(newRowsPerPage);
    };

    window.addEventListener("resize", calculateRowsPerPage);
    calculateRowsPerPage();
    return () => window.removeEventListener("resize", calculateRowsPerPage);
  }, [loading, repos]);

  // Формируем список для отображения
  const displayedRepos = useMemo(() => {
    return repos.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );
  }, [repos, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(repos.length / rowsPerPage); // Рассчитываем общее количество страниц

  const changePage = (direction: "next" | "previous") => {
    setCurrentPage((prev) => {
      if (direction === "next" && prev < totalPages) return prev + 1;
      if (direction === "previous" && prev > 1) return prev - 1;
      return prev;
    });
  };


  return (
      <div className="worksheet">
        {loading && <div className="loader">Загрузка...</div>}

        {error && <div className="error-message">Ошибка: {error}</div>}

        <div ref={containerRef} className="repos-grid">
          {displayedRepos.map((repo) => (
              <div
                  key={repo.id}
                  className="repo-card"
                  onClick={() => setActiveProject(repo)}
                  style={{ cursor: 'pointer' }}
              >
                <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="repo-link"
                    onClick={(e) => e.stopPropagation()}
                >
                  <h3>{repo.name}</h3>
                </a>
                {repo.description && <p>{repo.description}</p>}
                <div className="repo-meta">
                  {repo.language && <span>{repo.language}</span>}
                  <span>⭐ {repo.stargazers_count}</span>
                  <span>Обновлено: {new Date(repo.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
          ))}
        </div>

        {activeProject && (
            <div className="popup-overlay" onClick={() => setActiveProject(null)}>
              <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                <h2>{activeProject.name}</h2>
                <p><strong>Описание:</strong> {activeProject.description}</p>
                <p><strong>Сотрудники:</strong></p>
                <ul>
                  {activeProject.employees.map((emp, idx) => (
                      <li key={idx}>{emp.fio}</li>
                  ))}
                </ul>
                <button onClick={() => setActiveProject(null)}>Закрыть</button>
              </div>
            </div>
        )}

        {document.querySelector(".footer") &&
            ReactDOM.createPortal(
                <>
                  <button
                      className="footer__btn"
                      onClick={() => changePage("previous")}
                      disabled={currentPage === 1}
                  >
                    ◄
                  </button>
                  <div className="footer__place">
                    {currentTranslation.page} {currentPage} {currentTranslation.outOf} {totalPages}
                  </div>
                  <button
                      className="footer__btn"
                      onClick={() => changePage("next")}
                      disabled={currentPage === totalPages}
                  >
                    ►
                  </button>
                </>,
                document.querySelector(".footer") as Element
            )}
      </div>
  );
};

export default GitHubProjects;
