import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null; componentStack: string | null };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, componentStack: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
    this.setState({ componentStack: info.componentStack });
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-[#1A1A1A] p-8 text-white">
          <p className="text-orange-500 font-semibold text-sm">Render Error</p>
          <pre className="max-w-2xl overflow-auto rounded-lg bg-[#111] border border-red-500/30 p-4 text-xs text-red-300 whitespace-pre-wrap">
            {this.state.error.message}
            {"\n\n"}
            {this.state.componentStack ?? this.state.error.stack}
          </pre>
          <button
            onClick={() => this.setState({ error: null, componentStack: null })}
            className="text-xs text-white/40 hover:text-white underline"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
