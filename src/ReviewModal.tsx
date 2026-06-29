import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useUser } from './UserContext';

interface ReviewModalProps {
    show: Function;
    isOpen: boolean;
}

export default function ReviewModal({show, isOpen}: ReviewModalProps) {
  const [books, setBooks] = useState<[Book] | null>(null);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [error, setError] = useState(null);
  const logedUser = useUser().currentUser;

  // Cargar los libros únicamente cuando el modal se abre
  useEffect(() => {
    if (!isOpen) return;

    setLoadingBooks(true);
    setError(null);

    fetch('/api/books')
      .then((res) => {
        if (!res.ok) throw new Error('Error al cargar los libros');
        return res.json();
      })
      .then((data) => setBooks(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoadingBooks(false));
  }, [isOpen]);

  // Si el modal está cerrado, no se renderiza nada en el DOM
  if (!isOpen) return null;

  const handleSubmit = (e: any) => {
    e.preventDefault();
    
    // Captura de datos nativa con FormData
    const formData = new FormData(e.target);
    const data = {
      book_id: formData.get('book_id'),
      title: formData.get('title'),
      content: formData.get('content'),
      user: logedUser?.id,
    };

    fetch('/api/review', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Error al enviar la review');
        alert('Review enviada con éxito');
        show(false); // Cierra el modal tras el éxito
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  return createPortal(
    // Overlay oscuro de fondo
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={()=>show(false)}
    >
      {/* Contenedor del Modal (stopPropagation evita que los clics aquí dentro cierren el modal) */}
      <div 
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl z-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <h2 className="text-xl font-semibold text-gray-800">Dejar una Review</h2>
          <button 
            onClick={()=>show(false)}
            type="button" 
            className="text-2xl text-gray-400 hover:text-gray-600 transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Mensaje de error si falla la carga de libros */}
        {error && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
            {error}
          </p>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          {/* Select de Libros */}
          <div className="flex flex-col gap-1">
            <label htmlFor="book_id" className="text-sm font-medium text-gray-700">
              Seleccionar Libro:
            </label>
            <select 
              id="book_id" 
              name="book_id" 
              required 
              disabled={loadingBooks}
              className="w-full rounded border border-gray-300 bg-white p-2 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">
                {loadingBooks ? 'Cargando libros...' : '-- Elige un libro --'}
              </option>
              {books && books.map((book) => (
                  <option key={book.id} value={book.id}>
                  {book.title}
                </option>
              ))}
            </select>
          </div>

          {/* Input de Título */}
          <div className="flex flex-col gap-1">
            <label htmlFor="title" className="text-sm font-medium text-gray-700">
              Título:
            </label>
            <input 
              type="text" 
              id="title" 
              name="title" 
              required 
              placeholder="Ej: Excelente lectura o Me decepcionó"
              className="w-full rounded border border-gray-300 p-2 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Textarea de Contenido */}
          <div className="flex flex-col gap-1">
            <label htmlFor="content" className="text-sm font-medium text-gray-700">
              Review:
            </label>
            <textarea 
              id="content" 
              name="content" 
              required 
              rows={4}
              placeholder="Escribe tu opinión detallada aquí..."
              className="w-full resize-y rounded border border-gray-300 p-2 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Botón de Enviar */}
          <button 
            type="submit" 
            className="mt-2 w-full rounded bg-blue-600 p-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Enviar Review
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}