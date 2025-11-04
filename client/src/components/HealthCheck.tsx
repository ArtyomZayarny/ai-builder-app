import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { API, BACKEND_URL } from '../config';

interface HealthData {
  status: string;
  message: string;
  database?: string;
  timestamp: string;
}

interface HealthStatus {
  loading: boolean;
  data: HealthData | null;
  error: string | null;
}

export default function HealthCheck() {
  const [status, setStatus] = useState<HealthStatus>({ loading: true, data: null, error: null });

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(API.HEALTH);
        const data: HealthData = await response.json();
        setStatus({ loading: false, data, error: null });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        setStatus({ loading: false, data: null, error: errorMessage });
      }
    };

    checkHealth();
  }, []);

  if (status.loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2>🔍 Checking API Connection...</h2>
        </div>
      </div>
    );
  }

  if (status.error) {
    return (
      <div style={styles.container}>
        <div style={{ ...styles.card, ...styles.error }}>
          <h2>❌ API Connection Failed</h2>
          <p style={styles.message}>Error: {status.error}</p>
          <p style={styles.hint}>Make sure the backend server is running at: {BACKEND_URL}</p>
        </div>
      </div>
    );
  }

  if (!status.data) {
    return null;
  }

  return (
    <div style={styles.container}>
      <div style={{ ...styles.card, ...styles.success }}>
        <h2>✅ API Connection Successful</h2>
        <div style={styles.details}>
          <p>
            <strong>Backend URL:</strong> <span style={styles.url}>{BACKEND_URL}</span>
          </p>
          <p>
            <strong>Status:</strong> {status.data.status}
          </p>
          <p>
            <strong>Message:</strong> {status.data.message}
          </p>
          <p>
            <strong>Database:</strong> {status.data.database || 'N/A'}
          </p>
          <p>
            <strong>Timestamp:</strong> {new Date(status.data.timestamp).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '20px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '32px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    maxWidth: '500px',
    width: '100%',
  },
  success: {
    borderLeft: '6px solid #10b981',
  },
  error: {
    borderLeft: '6px solid #ef4444',
  },
  message: {
    color: '#6b7280',
    marginTop: '8px',
  },
  hint: {
    color: '#9ca3af',
    fontSize: '14px',
    marginTop: '12px',
    fontStyle: 'italic',
  },
  details: {
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid #e5e7eb',
  },
  url: {
    color: '#3b82f6',
    fontFamily: 'monospace',
    fontSize: '14px',
  },
};
