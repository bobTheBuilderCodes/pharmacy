import { useTheme } from "../context/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="button-muted inline-flex h-9 w-9 items-center justify-center p-0"
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12Zm0-16a1 1 0 0 1 1 1v1a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1Zm0 18a1 1 0 0 1 1 1v1a1 1 0 0 1-2 0v-1a1 1 0 0 1 1-1Zm10-8a1 1 0 0 1-1 1h-1a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1ZM4 12a1 1 0 0 1-1 1H2a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1Zm14.95 7.54a1 1 0 0 1-1.41 0l-.7-.71a1 1 0 1 1 1.41-1.41l.7.7a1 1 0 0 1 0 1.42ZM7.16 7.16a1 1 0 0 1-1.41 0l-.7-.7A1 1 0 1 1 6.46 5l.7.7a1 1 0 0 1 0 1.41Zm11.09-1.4a1 1 0 0 1 0 1.4l-.7.71a1 1 0 1 1-1.42-1.41l.71-.7a1 1 0 0 1 1.41 0ZM7.16 16.84a1 1 0 0 1 0 1.41l-.7.7a1 1 0 0 1-1.41-1.41l.7-.7a1 1 0 0 1 1.41 0Z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M21.75 15.5A9.75 9.75 0 0 1 8.5 2.25 9.75 9.75 0 1 0 21.75 15.5Z" />
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;
