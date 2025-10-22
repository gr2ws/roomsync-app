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
            contentContainerStyle={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 24,
            }}>
            <View className="max-w-md items-center">
              <AlertTriangle size={64} color="rgb(229, 77, 46)" className="mb-6" />

              <Text className="mb-2 text-center text-2xl font-bold text-foreground">
                Oops! Something went wrong
              </Text>

              <Text className="mb-6 text-center text-base text-muted-foreground">
                The app encountered an unexpected error.
              </Text>

              {__DEV__ && this.state.error && (
                <View className="mb-6 w-full rounded-lg border border-destructive/20 bg-destructive/10 p-4">
                  <Text className="mb-2 font-mono text-sm text-destructive">
                    {this.state.error.toString()}
                  </Text>
                  {this.state.errorInfo && (
                    <ScrollView className="max-h-48">
                      <Text className="font-mono text-xs text-muted-foreground">
                        {this.state.errorInfo.componentStack}
                      </Text>
                    </ScrollView>
                  )}
                </View>
              )}

              <TouchableOpacity
                onPress={this.handleReset}
                className="flex-row items-center justify-center rounded-lg bg-primary px-6 py-3 active:opacity-80">
                <RefreshCw size={20} color="white" className="mr-2" />
                <Text className="text-base font-semibold text-white">Back</Text>
              </TouchableOpacity>

              <Text className="mt-6 text-center text-sm text-muted-foreground">
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
