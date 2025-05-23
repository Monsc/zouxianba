import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    if (error && error.stack) {
      console.error('Error stack:', error.stack);
    }
    if (error && error.message) {
      console.error('Error message:', error.message);
    }
  }

  render() {
    if (this.state.hasError) {
      console.log(
        'ErrorBoundary render error:',
        this.state.error,
        JSON.stringify(this.state.error)
      );
      if (this.state.error && this.state.error.stack) {
        console.log('Error stack:', this.state.error.stack);
      }
      if (this.state.error && this.state.error.message) {
        console.log('Error message:', this.state.error.message);
      }
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">出错了！</h2>
              <p className="text-gray-600 mb-6">
                抱歉，应用程序遇到了一个错误。请刷新页面或稍后再试。
              </p>
              <pre style={{ color: 'red', fontSize: 12, wordBreak: 'break-all' }}>
                {this.state.error && this.state.error.toString()}
                {'\n'}
                {this.state.error && this.state.error.stack}
              </pre>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                刷新页面
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
