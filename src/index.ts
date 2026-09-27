import express, { Request, Response } from "express";

// Initialize the express app
const app = express();
app.use(express.json());

// In-memory data store
interface Book {
  id: number;
  title: string;
  author: string;
  price: number;
  category: string;
}

let books: Book[] = [
  { id: 1, title: "1984", author: "George Orwell", price: 15, category: "Fiction" },
  { id: 2, title: "The Hobbit", author: "J.R.R. Tolkien", price: 25, category: "Fantasy" },
];
let nextId = 3;

// Create: POST
app.post("/books", (req: Request, res: Response): void => {
  const { title, author, price, category } = req.body;

  // Validation
  if (!title || typeof title !== "string") {
    res.status(400).json({ error: "Title is required and must be a string." });
    return;
  }
  if (!author || typeof author !== "string") {
    res.status(400).json({ error: "Author is required and must be a string." });
    return;
  }
  if (price === undefined || typeof price !== "number" || price < 0) {
    res.status(400).json({ error: "Price is required and must be a positive number." });
    return;
  }
  if (!category || typeof category !== "string") {
    res.status(400).json({ error: "Category is required and must be a string." });
    return;
  }

  const newBook: Book = {
    id: nextId++,
    title,
    author,
    price,
    category,
  };

  books.push(newBook);
  res.status(201).json(newBook);
});

// Read: GET (with filtering)
app.get("/books", (req: Request, res: Response): void => {
  let filteredBooks = books;
  const { category, minPrice } = req.query;

  // Filter by category
  if (category) {
    if (typeof category !== "string") {
      res.status(400).json({ error: "Category query parameter must be a string." });
      return;
    }
    filteredBooks = filteredBooks.filter((b) => b.category.toLowerCase() === category.toLowerCase());
  }

  // Filter by minPrice
  if (minPrice) {
    const minPriceVal = parseFloat(minPrice as string);
    if (isNaN(minPriceVal)) {
      res.status(400).json({ error: "minPrice query parameter must be a valid number." });
      return;
    }
    filteredBooks = filteredBooks.filter((b) => b.price >= minPriceVal);
  }

  res.status(200).json(filteredBooks);
});

// Read: GET by ID
app.get("/books/:id", (req: Request, res: Response): void => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID format." });
    return;
  }

  const book = books.find((b) => b.id === id);
  if (!book) {
    res.status(404).json({ error: "Book not found." });
    return;
  }

  res.status(200).json(book);
});

// Update: PATCH
app.patch("/books/:id", (req: Request, res: Response): void => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID format." });
    return;
  }

  const bookIndex = books.findIndex((b) => b.id === id);
  if (bookIndex === -1) {
    res.status(404).json({ error: "Book not found." });
    return;
  }

  const { title, author, price, category } = req.body;

  // Validation
  if (title !== undefined && typeof title !== "string") {
    res.status(400).json({ error: "Title must be a string." });
    return;
  }
  if (author !== undefined && typeof author !== "string") {
    res.status(400).json({ error: "Author must be a string." });
    return;
  }
  if (price !== undefined && (typeof price !== "number" || price < 0)) {
    res.status(400).json({ error: "Price must be a positive number." });
    return;
  }
  if (category !== undefined && typeof category !== "string") {
    res.status(400).json({ error: "Category must be a string." });
    return;
  }

  const updatedBook = {
    ...books[bookIndex],
    ...req.body,
  };

  books[bookIndex] = updatedBook;
  res.status(200).json(updatedBook);
});

// Delete: DELETE
app.delete("/books/:id", (req: Request, res: Response): void => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID format." });
    return;
  }

  const bookIndex = books.findIndex((b) => b.id === id);
  if (bookIndex === -1) {
    res.status(404).json({ error: "Book not found." });
    return;
  }

  books.splice(bookIndex, 1);
  res.status(204).send();
});

// Running app
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

