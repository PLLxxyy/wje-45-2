import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BookShelf from "@/pages/BookShelf";
import ExcerptList from "@/pages/ExcerptList";
import ExcerptEditor from "@/pages/ExcerptEditor";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BookShelf />} />
        <Route path="/book/:bookId" element={<ExcerptList />} />
        <Route path="/book/:bookId/new" element={<ExcerptEditor />} />
        <Route path="/book/:bookId/edit/:excerptId" element={<ExcerptEditor />} />
      </Routes>
    </Router>
  );
}
