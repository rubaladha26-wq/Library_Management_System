
import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API = "http://localhost:5000/api/books";

function App() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    title: "",
    author: "",
    isbn: "",
    totalCopies: 1,
    availableCopies: 1,
  });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");

  const fetchBooks = async (searchValue = search) => {
    try {
      const res = await axios.get(API, {
        params: { search: searchValue },
      });
      setBooks(res.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load books");
    }
  };

  useEffect(() => {
    fetchBooks("");
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "totalCopies" || name === "availableCopies"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editId) {
        await axios.put(`${API}/${editId}`, form);
      } else {
        await axios.post(API, form);
      }

      resetForm();
      fetchBooks();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      author: "",
      isbn: "",
      totalCopies: 1,
      availableCopies: 1,
    });
    setEditId(null);
  };

  const handleEdit = (book) => {
    setForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
    });
    setEditId(book._id);
    setError("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this book?")) {
      return;
    }

    try {
      await axios.delete(`${API}/${id}`);
      fetchBooks();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  const handleIssue = async (id) => {
    try {
      await axios.patch(`${API}/${id}/issue`);
      fetchBooks();
    } catch (err) {
      setError(err.response?.data?.message || "Issue failed");
    }
  };

  const handleReturn = async (id) => {
    try {
      await axios.patch(`${API}/${id}/return`);
      fetchBooks();
    } catch (err) {
      setError(err.response?.data?.message || "Return failed");
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    fetchBooks(value);
  };

  const totalBooks = books.reduce(
    (sum, book) => sum + book.totalCopies,
    0
  );

  const availableBooks = books.reduce(
    (sum, book) => sum + book.availableCopies,
    0
  );

  const issuedBooks = totalBooks - availableBooks;

  return (
    <div className="container">
      <header className="header">
        <h1>📚 Library Management System</h1>
        <p>Manage books, issues and returns</p>
      </header>

      <section className="stats">
        <div className="stat-card">
          <h3>Total Copies</h3>
          <h2>{totalBooks}</h2>
        </div>

        <div className="stat-card">
          <h3>Available</h3>
          <h2>{availableBooks}</h2>
        </div>

        <div className="stat-card">
          <h3>Issued</h3>
          <h2>{issuedBooks}</h2>
        </div>
      </section>

      <section className="form-section">
        <h2>{editId ? "Update Book" : "Add New Book"}</h2>

        <form onSubmit={handleSubmit}>
          <input
            name="title"
            placeholder="Book Title"
            value={form.title}
            onChange={handleChange}
            required
          />

          <input
            name="author"
            placeholder="Author"
            value={form.author}
            onChange={handleChange}
            required
          />

          <input
            name="isbn"
            placeholder="ISBN"
            value={form.isbn}
            onChange={handleChange}
            required
          />

          <input
            name="totalCopies"
            type="number"
            min="1"
            placeholder="Total Copies"
            value={form.totalCopies}
            onChange={handleChange}
            required
          />

          <input
            name="availableCopies"
            type="number"
            min="0"
            max={form.totalCopies}
            placeholder="Available Copies"
            value={form.availableCopies}
            onChange={handleChange}
            required
          />

          <button type="submit">
            {editId ? "Update Book" : "Add Book"}
          </button>

          {editId && (
            <button
              type="button"
              className="cancel"
              onClick={resetForm}
            >
              Cancel
            </button>
          )}
        </form>
      </section>

      <section className="list-section">
        <h2>Book List</h2>

        <input
          className="search"
          placeholder="Search by book title..."
          value={search}
          onChange={handleSearch}
        />

        {error && <p className="error">{error}</p>}

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>ISBN</th>
                <th>Total</th>
                <th>Available</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {books.map((book) => (
                <tr key={book._id}>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.isbn}</td>
                  <td>{book.totalCopies}</td>
                  <td>{book.availableCopies}</td>
                  <td className="actions">
                    <button
                      className="issue"
                      disabled={book.availableCopies === 0}
                      onClick={() => handleIssue(book._id)}
                    >
                      Issue
                    </button>

                    <button
                      className="return"
                      disabled={
                        book.availableCopies >= book.totalCopies
                      }
                      onClick={() => handleReturn(book._id)}
                    >
                      Return
                    </button>

                    <button
                      className="edit"
                      onClick={() => handleEdit(book)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete"
                      onClick={() => handleDelete(book._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {books.length === 0 && (
                <tr>
                  <td colSpan="6">No books found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default App;
