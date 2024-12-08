// App.tsx
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import HomeView from "./components/HomeView";
import AsciiView from "./components/AsciiView";
import MovieAsciiView from "./components/ScriptAsciiView";
import DitheringView from "./components/DitheringView";

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            <div className="mr-4 flex">
              <Link to="/" className="mr-6 flex items-center space-x-2">
                <span className="font-bold">PixelScript</span>
              </Link>
            </div>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link
                to="/ascii"
                className="transition-colors hover:text-foreground/80 text-foreground"
              >
                Random ASCII
              </Link>
              <Link
                to="/movie-ascii"
                className="transition-colors hover:text-foreground/80 text-foreground"
              >
                Text ASCII
              </Link>
              <Link
                to="/dithering"
                className="transition-colors hover:text-foreground/80 text-foreground"
              >
                Dithering
              </Link>
            </nav>
          </div>
        </header>

        <main className="container py-6">
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/ascii" element={<AsciiView />} />
            <Route path="/movie-ascii" element={<MovieAsciiView />} />
            <Route path="/dithering" element={<DitheringView />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
