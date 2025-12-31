import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Home, Search, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <div className="glass-card p-6 sm:p-8 lg:p-12 text-center max-w-2xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse"></div>
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-primary" />
            </div>
          </div>
        </div>

        {/* 404 Text */}
        <div className="space-y-3 sm:space-y-4">
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
            Page Not Found
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Route Info */}
        <div className="p-3 sm:p-4 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <Search className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="font-mono break-all">{location.pathname}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2 sm:pt-4">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="w-full sm:w-auto h-11 sm:h-12 text-sm sm:text-base font-semibold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          <Button
            onClick={() => navigate("/")}
            className="w-full sm:w-auto h-11 sm:h-12 text-sm sm:text-base font-semibold"
          >
            <Home className="w-4 h-4 mr-2" />
            Return Home
          </Button>
        </div>

        {/* Additional Help */}
        <div className="pt-4 sm:pt-6 border-t border-border">
          <p className="text-xs sm:text-sm text-muted-foreground mb-3">
            Need help? Try one of these:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              onClick={() => navigate("/")}
              variant="ghost"
              size="sm"
              className="text-xs sm:text-sm"
            >
              Dashboard
            </Button>
            <Button
              onClick={() => navigate("/")}
              variant="ghost"
              size="sm"
              className="text-xs sm:text-sm"
            >
              POS Terminal
            </Button>
            <Button
              onClick={() => navigate("/")}
              variant="ghost"
              size="sm"
              className="text-xs sm:text-sm"
            >
              Admin Panel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
