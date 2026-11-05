import { Component, type ReactNode } from "react";
import { ErrorNotice } from "./ErrorNotice";

interface ScreenErrorBoundaryProps {
  children: ReactNode;
}

interface ScreenErrorBoundaryState {
  error: Error | null;
}

export class ScreenErrorBoundary extends Component<ScreenErrorBoundaryProps, ScreenErrorBoundaryState> {
  state: ScreenErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): ScreenErrorBoundaryState {
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }

  render() {
    return this.state.error ? <ErrorNotice error={this.state.error} /> : this.props.children;
  }
}
