import React from 'react';

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(_: Error): ErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        console.log('Error caught by boundary:', error, errorInfo);
    }

    render(): React.ReactNode {
        if (this.state.hasError) {
            return React.createElement('h1', null, 'Something went wrong.');
        }

        return this.props.children;
    }
}

export default ErrorBoundary;