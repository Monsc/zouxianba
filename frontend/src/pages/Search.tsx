import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { useDebounce } from '../hooks/useDebounce';
import { formatDistanceToNow } from 'date-fns';

interface SearchResult {
  id: string;
  type: 'user' | 'post';
  content: string;
  user?: {
    id: string;
    username: string;
    handle: string;
    avatar: string;
  };
  createdAt?: Date;
  likes?: number;
  comments?: number;
}

type SortOption = 'relevance' | 'recent' | 'popular';
type TimeFilter = 'all' | 'day' | 'week' | 'month' | 'year';

export const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'users' | 'posts'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [showFilters, setShowFilters] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  const search = useCallback(async () => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(debouncedQuery)}&type=${activeTab}&sort=${sortBy}&time=${timeFilter}`
      );
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery, activeTab, sortBy, timeFilter]);

  useEffect(() => {
    search();
  }, [search]);

  const renderFilters = () => (
    <div className="filters-container slide-up" style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
        <div style={{ flex: 1 }}>
          <label className="input-label">Sort by</label>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortOption)}
            className="input"
          >
            <option value="relevance">Relevance</option>
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label className="input-label">Time</label>
          <select
            value={timeFilter}
            onChange={e => setTimeFilter(e.target.value as TimeFilter)}
            className="input"
          >
            <option value="all">All time</option>
            <option value="day">Past 24 hours</option>
            <option value="week">Past week</option>
            <option value="month">Past month</option>
            <option value="year">Past year</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderResult = (result: SearchResult) => {
    if (result.type === 'user' && result.user) {
      return (
        <Link
          to={`/profile/${result.user.id}`}
          className="search-result-item hover-scale"
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-color)',
            textDecoration: 'none',
            color: 'inherit',
            transition: 'background-color 0.2s',
          }}
        >
          <img
            src={result.user.avatar}
            alt={result.user.username}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              marginRight: '12px',
            }}
          />
          <div>
            <div style={{ fontWeight: 'bold' }}>{result.user.username}</div>
            <div style={{ color: 'var(--text-secondary)' }}>@{result.user.handle}</div>
          </div>
        </Link>
      );
    }

    return (
      <div
        className="search-result-item hover-scale"
        style={{
          padding: '16px',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          {result.user && (
            <img
              src={result.user.avatar}
              alt={result.user.username}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
              }}
            />
          )}
          <div style={{ flex: 1 }}>
            {result.user && (
              <Link
                to={`/profile/${result.user.id}`}
                style={{
                  color: 'inherit',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                }}
              >
                {result.user.username}
              </Link>
            )}
            <p style={{ margin: '4px 0' }}>{result.content}</p>
            <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '0.9em' }}>
              {result.createdAt && (
                <span>{formatDistanceToNow(new Date(result.createdAt), { addSuffix: true })}</span>
              )}
              {result.likes !== undefined && (
                <span>❤️ {result.likes}</span>
              )}
              {result.comments !== undefined && (
                <span>💬 {result.comments}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      <Header />
      
      <main className="main-content">
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              placeholder="Search users or posts..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="input"
              style={{ flex: 1 }}
            />
            <button
              className="btn"
              onClick={() => setShowFilters(!showFilters)}
              style={{ padding: '0 16px' }}
            >
              <i className={`fas fa-${showFilters ? 'times' : 'filter'}`}></i>
            </button>
          </div>
          
          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginTop: '16px',
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            <button
              className={`tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All
            </button>
            <button
              className={`tab ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              Users
            </button>
            <button
              className={`tab ${activeTab === 'posts' ? 'active' : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              Posts
            </button>
          </div>
        </div>

        {showFilters && renderFilters()}

        {isLoading ? (
          <div className="container" style={{ textAlign: 'center', padding: '32px' }}>
            <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
          </div>
        ) : results.length === 0 ? (
          <div className="container" style={{ textAlign: 'center', padding: '32px' }}>
            {query.trim() ? 'No results found' : 'Start typing to search'}
          </div>
        ) : (
          <div className="search-results fade-in">
            {results.map(result => (
              <div key={result.id}>{renderResult(result)}</div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}; 