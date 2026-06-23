import { useMemo, useState } from "react";
import "./data/booksRaw";

const booksData = JSON.parse(globalThis.BOOKS_RAW_JSON);

function normalizeBooks(data) {
  const rawBooks = Array.isArray(data?.books?.[0]) ? data.books[0] : data?.books ?? [];

  return rawBooks.map((book) => ({
    ...book,
    isFav: Boolean(book.isFav),
    read: Boolean(book.read),
  }));
}

function getDescription(book) {
  return book.shortDescription || book.longDescription || "Aucune description disponible.";
}

function BookCard({ book, onOpenPreview, onToggleFavorite, onToggleRead }) {
  return (
    <article className="book-card">
      <button className="book-cover-button" type="button" onClick={() => onOpenPreview(book)}>
        <img
          className="book-cover"
          src={book.thumbnailUrl}
          alt={`Couverture du livre ${book.title}`}
        />
      </button>

      <div className="book-content">
        <div className="book-meta">
          <span>{book.categories?.join(", ") || "Sans categorie"}</span>
          <span>{book.pageCount ? `${book.pageCount} pages` : "Pages inconnues"}</span>
        </div>

        <h2>{book.title}</h2>
        <p className="book-description">{getDescription(book)}</p>

        <div className="book-actions">
          <button
            className={book.isFav ? "active" : ""}
            type="button"
            onClick={() => onToggleFavorite(book.isbn)}
          >
            {book.isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
          </button>

          <button
            className={book.read ? "active" : ""}
            type="button"
            onClick={() => onToggleRead(book.isbn)}
          >
            {book.read ? "Retirer de ma liste" : "Je souhaite le lire"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function App() {
  const [books, setBooks] = useState(() => normalizeBooks(booksData));
  const [search, setSearch] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showReadOnly, setShowReadOnly] = useState(false);
  const [previewBook, setPreviewBook] = useState(null);

  const favoriteBooks = books.filter((book) => book.isFav);
  const readingListBooks = books.filter((book) => book.read);

  const filteredBooks = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return books.filter((book) => {
      const matchesTitle = book.title.toLowerCase().includes(normalizedSearch);
      const matchesFavorites = !showFavoritesOnly || book.isFav;
      const matchesRead = !showReadOnly || book.read;

      return matchesTitle && matchesFavorites && matchesRead;
    });
  }, [books, search, showFavoritesOnly, showReadOnly]);

  const favoritesCount = favoriteBooks.length;
  const readCount = readingListBooks.length;

  function toggleField(isbn, field) {
    setBooks((currentBooks) =>
      currentBooks.map((book) =>
        book.isbn === isbn ? { ...book, [field]: !book[field] } : book,
      ),
    );
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Prototype React</p>
          <h1>Traqueur de lecture</h1>
          <p className="hero-copy">
            Recherchez un livre, ajoutez-le en favoris et gardez une liste claire
            des ouvrages que vous souhaitez lire.
          </p>
        </div>

        <div className="hero-stats">
          <div>
            <strong>{books.length}</strong>
            <span>livres</span>
          </div>
          <div>
            <strong>{favoritesCount}</strong>
            <span>favoris</span>
          </div>
          <div>
            <strong>{readCount}</strong>
            <span>souhaits</span>
          </div>
        </div>
      </header>

      <section className="toolbar" aria-label="Filtres de livres">
        <label className="search-field">
          <span>Rechercher par titre</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Ex. Android, Rails, Java..."
          />
        </label>

        <div className="filter-actions">
          <button
            className={showFavoritesOnly ? "active" : ""}
            type="button"
            onClick={() => setShowFavoritesOnly((current) => !current)}
          >
            {showFavoritesOnly ? "Retirer filtre favori" : "Filtrer selon mes favoris"}
          </button>

          <button
            className={showReadOnly ? "active" : ""}
            type="button"
            onClick={() => setShowReadOnly((current) => !current)}
          >
            {showReadOnly ? "Retirer filtre souhait" : "Filtrer selon mes souhaits"}
          </button>
        </div>
      </section>

      <section className="results-header" aria-live="polite">
        <p>{filteredBooks.length} livre(s) affiché(s)</p>
      </section>

      <section className="books-grid">
        {filteredBooks.length > 0 ? (
          filteredBooks.map((book) => (
            <BookCard
              key={book.isbn}
              book={book}
              onOpenPreview={(selectedBook) => setPreviewBook(selectedBook)}
              onToggleFavorite={(isbn) => toggleField(isbn, "isFav")}
              onToggleRead={(isbn) => toggleField(isbn, "read")}
            />
          ))
        ) : (
          <div className="empty-state">
            <h2>Aucun livre ne correspond à votre recherche</h2>
            <p>Essayez un autre titre ou retirez un filtre actif.</p>
          </div>
        )}
      </section>

      <section className="lists-section">
        <div className="list-panel">
          <div className="list-panel-header">
            <h2>Mes favoris</h2>
            <span>{favoritesCount}</span>
          </div>

          {favoriteBooks.length > 0 ? (
            <ul className="book-list">
              {favoriteBooks.map((book) => (
                <li key={`fav-${book.isbn}`}>{book.title}</li>
              ))}
            </ul>
          ) : (
            <p className="list-empty">Aucun favori pour le moment.</p>
          )}
        </div>

        <div className="list-panel">
          <div className="list-panel-header">
            <h2>Ma liste de lecture</h2>
            <span>{readCount}</span>
          </div>

          {readingListBooks.length > 0 ? (
            <ul className="book-list">
              {readingListBooks.map((book) => (
                <li key={`read-${book.isbn}`}>{book.title}</li>
              ))}
            </ul>
          ) : (
            <p className="list-empty">Aucun livre ajoute a votre liste.</p>
          )}
        </div>
      </section>

      {previewBook ? (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="preview-title"
          onClick={() => setPreviewBook(null)}
        >
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <button
              className="modal-close"
              type="button"
              aria-label="Fermer l'aperçu"
              onClick={() => setPreviewBook(null)}
            >
              ×
            </button>

            <img
              className="modal-image"
              src={previewBook.thumbnailUrl}
              alt={`Couverture du livre ${previewBook.title}`}
            />

            <div className="modal-content">
              <h2 id="preview-title">{previewBook.title}</h2>
              <p>{getDescription(previewBook)}</p>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
