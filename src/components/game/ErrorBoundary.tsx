import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

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
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Game Error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    localStorage.removeItem('forest_game_save');
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
          <div className="space-y-6 max-w-md">
            <div className="text-6xl">💀</div>
            
            <h1 className="text-4xl font-creepy text-danger">
              حدث خطأ!
            </h1>
            
            <p className="text-muted-foreground">
              واجهت اللعبة مشكلة غير متوقعة. يمكنك إعادة تحميل الصفحة أو البدء من جديد.
            </p>
            
            <div className="bg-muted/50 p-4 rounded-lg text-left overflow-auto max-h-32">
              <code className="text-xs text-danger/80">
                {this.state.error?.message || 'Unknown error'}
              </code>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={this.handleReload}
                className="bg-primary hover:bg-primary/80"
              >
                إعادة تحميل
              </Button>
              
              <Button
                onClick={this.handleReset}
                variant="outline"
                className="border-danger text-danger hover:bg-danger/10"
              >
                حذف الحفظ والبدء من جديد
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
