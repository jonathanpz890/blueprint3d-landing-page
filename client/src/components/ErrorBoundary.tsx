import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '2rem', 
          maxWidth: '800px', 
          margin: '4rem auto', 
          border: '1px solid #ef4444', 
          borderRadius: '16px', 
          backgroundColor: '#fef2f2', 
          color: '#991b1b', 
          direction: 'ltr', 
          textAlign: 'left',
          boxShadow: '0 10px 25px rgba(239, 68, 68, 0.15)',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#b91c1c' }}>Rendering Error Detected</h2>
          <p style={{ fontSize: '1rem', marginBottom: '1.5rem', color: '#7f1d1d' }}>The application encountered an unexpected runtime crash in this view. Details are provided below:</p>
          <pre style={{ 
            whiteSpace: 'pre-wrap', 
            fontFamily: 'monospace', 
            fontSize: '0.875rem', 
            backgroundColor: '#fff', 
            padding: '1rem', 
            borderRadius: '8px', 
            border: '1px solid #fca5a5',
            overflowX: 'auto',
            maxHeight: '400px'
          }}>
            {this.state.error && this.state.error.toString()}
            {this.state.error && this.state.error.stack && `\n\nStack Trace:\n${this.state.error.stack}`}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              marginTop: '1.5rem', 
              padding: '0.75rem 1.5rem', 
              backgroundColor: '#ef4444', 
              color: '#ffffff', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              fontWeight: 'bold',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
