interface CategoryNavProps {
    theme: "light" | "dark";
  }
  
  export function CategoryNav({ theme }: CategoryNavProps) {
    const isDark = theme === "dark";
  
    return (
      <nav className={`border-b ${isDark ? "border-white/5" : "border-gray-100"} mb-6`}>
        <div className="flex items-center gap-6 overflow-x-auto pb-3">
          <a
            href="#"
            className={`whitespace-nowrap transition-colors ${
              isDark ? "text-gray-400 hover:text-cyan-400" : "text-gray-600 hover:text-cyan-600"
            }`}
          >
            Home
          </a>
          <a
            href="#"
            className={`whitespace-nowrap transition-colors ${
              isDark ? "text-gray-400 hover:text-cyan-400" : "text-gray-600 hover:text-cyan-600"
            }`}
          >
            Technology
          </a>
          <a
            href="#"
            className={`whitespace-nowrap transition-colors ${
              isDark ? "text-gray-400 hover:text-cyan-400" : "text-gray-600 hover:text-cyan-600"
            }`}
          >
            Design
          </a>
          <a
            href="#"
            className={`whitespace-nowrap transition-colors ${
              isDark ? "text-gray-400 hover:text-cyan-400" : "text-gray-600 hover:text-cyan-600"
            }`}
          >
            Culture
          </a>
          <a
            href="#"
            className={`whitespace-nowrap transition-colors ${
              isDark ? "text-gray-400 hover:text-cyan-400" : "text-gray-600 hover:text-cyan-600"
            }`}
          >
            Business
          </a>
        </div>
      </nav>
    );
  }
  