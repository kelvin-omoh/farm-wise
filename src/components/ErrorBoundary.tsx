import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
    children: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
    errorInfo: ErrorInfo | null
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        this.setState({
            error: error,
            errorInfo: errorInfo
        })
        console.error("Error caught by ErrorBoundary:", error, errorInfo)
    }

    render(): ReactNode {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-100">
                    <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
                        <div className="bg-gray-100 p-4 rounded overflow-auto mb-4">
                            <p className="font-mono text-sm">{this.state.error?.toString()}</p>
                        </div>
                        {this.state.errorInfo && (
                            <details className="mb-4">
                                <summary className="cursor-pointer text-blue-600">Component Stack</summary>
                                <div className="mt-2 bg-gray-100 p-4 rounded overflow-auto">
                                    <p className="font-mono text-sm whitespace-pre-wrap">
                                        {this.state.errorInfo.componentStack}
                                    </p>
                                </div>
                            </details>
                        )}
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary 