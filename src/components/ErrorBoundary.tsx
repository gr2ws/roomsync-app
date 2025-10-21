import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 bg-background">
          <ScrollView
            className="flex-1"
            contentContainerClassName="flex-1 items-center justify-center px-6">
            <View className="items-center max-w-md">
              <AlertTriangle size={64} color="rgb(229, 77, 46)" className="mb-6" />

              <Text className="text-2xl font-bold text-foreground mb-2 text-center">
                Oops! Something went wrong
              </Text>

              <Text className="text-base text-muted-foreground mb-6 text-center">
                The app encountered an unexpected error. Don&apos;t worry, your data is safe.
              </Text>

              {__DEV__ && this.state.error && (
                <View className="w-full mb-6 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                  <Text className="text-sm font-mono text-destructive mb-2">
                    {this.state.error.toString()}
                  </Text>
                  {this.state.errorInfo && (
                    <ScrollView className="max-h-48">
                      <Text className="text-xs font-mono text-muted-foreground">
                        {this.state.errorInfo.componentStack}
                      </Text>
                    </ScrollView>
                  )}
                </View>
              )}

              <TouchableOpacity
                onPress={this.handleReset}
                className="flex-row items-center justify-center bg-primary px-6 py-3 rounded-lg active:opacity-80">
                <RefreshCw size={20} color="white" className="mr-2" />
                <Text className="text-white font-semibold text-base">Try Again</Text>
              </TouchableOpacity>

              <Text className="text-sm text-muted-foreground mt-6 text-center">
                If this problem persists, please try restarting the app.
              </Text>
            </View>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
