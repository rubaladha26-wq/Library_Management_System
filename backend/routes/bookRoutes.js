const express = require("express");
const router = express.Router();
const Book = require("../models/Book");

// Add book
router.post("/", async (req, res) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json(book);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all books and search by title
router.get("/", async (req, res) => {
  try {
    const search = req.query.search || "";

    const books = await Book.find({
      title: { $regex: search, $options: "i" },
    }).sort({ createdAt: -1 });

    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update book
router.put("/:id", async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(book);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete book
router.delete("/:id", async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Issue book
router.patch("/:id/issue", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({ message: "No copies available" });
    }

    book.availableCopies -= 1;
    await book.save();

    res.json({ message: "Book issued successfully", book });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Return book
router.patch("/:id/return", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (book.availableCopies >= book.totalCopies) {
      return res.status(400).json({ message: "All copies are already available" });
    }

    book.availableCopies += 1;
    await book.save();

    res.json({ message: "Book returned successfully", book });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;