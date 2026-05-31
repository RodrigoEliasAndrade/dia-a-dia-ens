import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="min-h-screen bg-ens-cream flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm w-full text-center">
          <div className="text-4xl mb-3">🙏</div>
          <h2 className="text-lg font-bold text-ens-blue mb-2">
            Algo inesperado aconteceu
          </h2>
          <p className="text-sm text-ens-text-light mb-4">
            Desculpe pelo inconveniente. Você pode tentar recarregar o app.
          </p>
          {this.state.error?.message && (
            <p className="text-xs text-gray-400 mb-4 font-mono break-all">
              {this.state.error.message}
            </p>
          )}
          <div className="flex flex-col gap-2">
            <button
              onClick={this.handleReload}
              className="w-full py-3 rounded-xl bg-ens-blue text-white font-semibold"
            >
              Recarregar app
            </button>
            <button
              onClick={this.handleReset}
              className="w-full py-2 text-sm text-ens-blue font-medium"
            >
              Tentar continuar
            </button>
          </div>
        </div>
      </div>
    );
  }
}
