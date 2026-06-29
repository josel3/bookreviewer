import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "./Header";

const Placeholder =
  "https://tools-api.webcrumbs.org/image-placeholder/150/150/abstract/1";

interface ReviewSummary {
  id: string;
  image?: string;
  bookTitle: string;
  reviewTitle: string;
}

interface UserData {
  username: string;
  userDescription: string;
  avatar?: string;
  userReviews?: ReviewSummary[];
  userFavs?: ReviewSummary[];
}

const Profile = () => {
  const { id } = useParams();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", isError: false });

  // Estados del formulario
  const [username, setUsername] = useState("");
  const [userDescription, setUserDescription] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/user/${id}`);
        const data = await response.json();
        setUserData(data);
        
        setUsername(data.username || "");
        setUserDescription(data.userDescription || "");
      } catch (error) {
        console.error("Error fetching user data:", error);
        setMessage({ text: "Error al cargar el perfil.", isError: true });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: "", isError: false });

    if (password && password !== confirmPassword) {
      setMessage({ text: "Las contraseñas no coinciden.", isError: true });
      return;
    }

    setIsSaving(true);

    try {
      const updatedFields: any = {
        username,
        userDescription,
      };
      if (password) {
        updatedFields.password = password;
      }

      const response = await fetch(`/api/user/${id}`, {
        method: "PUT", // O "POST" según tu backend
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFields),
      });

      if (!response.ok) throw new Error("Error en la respuesta del servidor");

      setMessage({ text: "¡Perfil actualizado con éxito!", isError: false });
      
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ text: "No se pudo actualizar el perfil.", isError: true });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!userData) {
    return <div className="p-6">Usuario no encontrado.</div>;
  }

  return (
    <div className="bg-white min-h-screen">
      <Header />
      <div className="shadow rounded-lg p-6 max-w-4xl mx-auto">
        
        {/* Formulario de Edición de Perfil */}
        <form onSubmit={handleSubmit} className="mb-8 border-b border-neutral-200 pb-8">
          <h1 className="text-2xl font-title text-neutral-950 mb-6 font-bold">
            Editar Mi Perfil de Reviewer
          </h1>

          {message.text && (
            <div className={`p-4 mb-4 rounded-md text-sm ${message.isError ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
              {message.text}
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar a la izquierda */}
            <div className="flex flex-col items-center gap-2">
              <img
                src={userData.avatar || Placeholder}
                alt="User Avatar"
                className="w-[80px] h-[80px] rounded-full object-cover border border-neutral-200"
              />
              <span className="text-xs text-neutral-500">Avatar actual</span>
            </div>

            {/* Campos a la derecha */}
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Nombre de usuario
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-950 text-neutral-950"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Biografía / Descripción del Reviewer
                </label>
                <textarea
                  value={userDescription}
                  onChange={(e) => setUserDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-950 text-neutral-950 resize-none"
                />
              </div>

              {/* Sección de seguridad / contraseña */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Nueva contraseña <span className="text-xs text-neutral-400">(opcional)</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Dejar en blanco para no cambiar"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-950 text-neutral-950 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Confirmar nueva contraseña
                  </label>
                  <input
                    type="password"
                    placeholder="Repetir nueva contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-950 text-neutral-950 text-sm"
                  />
                </div>
              </div>

              {/* Botón de envío */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-neutral-950 text-white rounded-md text-sm font-medium hover:bg-neutral-800 disabled:bg-neutral-400 transition-colors"
                >
                  {isSaving ? "Guardando cambios..." : "Guardar Perfil"}
                </button>
              </div>

            </div>
          </div>
        </form>

        {/* Sección estática inferior (Tus Reviews) */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-neutral-950 mb-4">
            Mis Reviews ({userData.userReviews?.length || 0})
          </h2>
          <div className="space-y-4">
            {userData.userReviews && userData.userReviews.length > 0 ? (
              userData.userReviews.map((review, index) => (
                <Link to={`/review/${review.id}`} key={`review-${index}-${review.id}`}>
                  <article className="bg-neutral-100 p-4 rounded-md flex gap-4 hover:bg-neutral-200 transition-colors">
                    <img
                      src={review.image || Placeholder}
                      alt="Book Cover"
                      className="w-[48px] h-[72px] rounded-md object-cover"
                    />
                    <div>
                      <h3 className="font-medium text-neutral-950">
                        {review.bookTitle}
                      </h3>
                      <p className="text-neutral-700 mt-1">
                        {review.reviewTitle}
                      </p>
                    </div>
                  </article>
                </Link>
              ))
            ) : (
              <p className="text-sm text-neutral-500 italic">Nada por aquí..</p>
            )}
          </div>
        </section>

        {/* Sección estática inferior (Reviews Favoritas) */}
        <section>
          <h2 className="text-xl font-semibold text-neutral-950 mb-4">
            Reviews que me gustaron
          </h2>
          <div className="space-y-4">
            {userData.userFavs && userData.userFavs.length > 0 ? (
              userData.userFavs.map((likedReview, index) => (
                <Link to={`/review/${likedReview.id}`} key={`liked-${index}-${likedReview.id}`}>
                  <article className="bg-neutral-100 p-4 rounded-md flex gap-4 hover:bg-neutral-200 transition-colors">
                    <img
                      src={likedReview.image || Placeholder}
                      alt="Book Cover"
                      className="w-[48px] h-[72px] rounded-md object-cover"
                    />
                    <div>
                      <h3 className="font-medium text-neutral-950">
                        {likedReview.bookTitle}
                      </h3>
                      <p className="text-neutral-700 mt-1">
                        {likedReview.reviewTitle}
                      </p>
                    </div>
                  </article>
                </Link>
              ))
            ) : (
              <p className="text-sm text-neutral-500 italic">Nada por aquí..</p>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default Profile;