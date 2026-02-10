import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

interface MobileNavProps {
  isAuthenticated: boolean;
  userName?: string;
  onDashboard: () => void;
  onDemo: () => void;
  onPricing: () => void;
  onBlog: () => void;
  onLogout: () => void;
  onLogin: () => void;
  children?: React.ReactNode;
}

export function MobileNav({
  isAuthenticated,
  userName,
  onDashboard,
  onDemo,
  onPricing,
  onBlog,
  onLogout,
  onLogin,
  children,
}: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = (callback: () => void) => {
    callback();
    setIsOpen(false);
  };

  return (
    <div className="lg:hidden">
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-muted rounded-lg transition-colors duration-200"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-foreground" />
        ) : (
          <Menu className="w-6 h-6 text-foreground" />
        )}
      </button>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-background border-b border-border/40 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
            <Button
              variant="ghost"
              onClick={() => handleNavClick(onDemo)}
              className="w-full justify-start text-foreground hover:text-primary"
            >
              Try Demo
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleNavClick(onPricing)}
              className="w-full justify-start text-foreground hover:text-primary"
            >
              Pricing
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleNavClick(onBlog)}
              className="w-full justify-start text-foreground hover:text-primary"
            >
              Blog
            </Button>
            <div className="border-t border-border/40 pt-2 mt-2">
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-2 text-sm text-muted-foreground">
                    Welcome, {userName || "User"}
                  </div>
                  <Button
                    onClick={() => handleNavClick(onDashboard)}
                    className="w-full justify-start bg-primary hover:bg-primary/90 mb-2"
                  >
                    Dashboard
                  </Button>
                  <Button
                    onClick={() => handleNavClick(onLogout)}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => handleNavClick(onLogin)}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  Get Started
                </Button>
              )}
            </div>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
