import React, { useState } from "react";
import "./LoginModal.css";

interface LoginModalProps {
    show: Function;
}

function LoginModal(props: LoginModalProps) {
    const show = props.show;
    const [toggleForm, setToggleForm] = useState(true);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: formData.get("username"),
                    pass: formData.get("pass"),
                }),
                credentials: "include",
                mode: "cors"
            });

            if (!response.ok) {
                const data = await response.json();
                setError(data.error || "Error al iniciar sesión");
                return;
            }

            const data = await response.json();
            if (data.error) {
                setError(data.error);
            } else {
                show(false);
                window.location.reload();
            }
        } catch (err) {
            console.error("Error en login:", err);
            setError("Error al iniciar sesión");
        }
    };

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const pass = formData.get("pass");
        const repPass = formData.get("rep-pass");
        
        if (pass !== repPass) {
            setError("Las contraseñas no coinciden");
            return;
        }

        try {
            console.log('Iniciando petición de registro...');
            const response = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    username: formData.get("username"),
                    pass: formData.get("pass"),
                }),
                credentials: "include",
                mode: "cors"
            });
            
            console.log('Respuesta recibida:', response);
            console.log('Status:', response.status);
            console.log('Headers:', response.headers);
            
            if (!response.ok) {
                const data = await response.json();
                console.error('Error en la respuesta:', data);
                setError(data.error || "Error al registrar usuario");
                return;
            }
            
            const data = await response.json();
            console.log('Datos recibidos:', data);
            if (data.error) {
                setError(data.error);
            } else {
                show(false);
                window.location.reload();
            }
        } catch (err) {
            console.error("Error detallado en registro:", err);
            setError("Error al registrar usuario");
        }
    };

    return (
        <div className="login-modal-container fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center" onClick={() => show(false)}>
            <div className="login-modal relative transition-all duration-300 ease-in-out transition-normal" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn bg-purple-900 text-white text-center align-top rounded-sm px-2 absolute top-2 right-2" onClick={() => show(false)}>X</button>
                {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
                {toggleForm ? 
                    <section className="login flex flex-col items-left justify-center">
                        <h1 className="text-center">Iniciar sesión</h1>
                        <form onSubmit={handleLogin} className="flex flex-col items-left justify-center">
                            <label htmlFor="username">Usuario:</label>
                            <input type="text" name="username" id="username" className="border-2 rounded-md border-indigo-400"/>
                            <label htmlFor="pass">Contraseña:</label>
                            <input type="password" name="pass" id="pass" className="border-2 rounded-md border-indigo-400"/>
                            <button type="submit" className="bg-purple-900 text-white text-center align-top mt-2 rounded-sm px-2 self-end">Iniciar sesión</button>
                        </form>
                    </section>
                    :
                    <section className="signup">
                        <h1 className="text-center">Registrarse</h1>
                        <form onSubmit={handleSignup} className="login flex flex-col items-left justify-center">
                            <label htmlFor="username">Usuario:</label>
                            <input type="text" name="username" id="username" className="border-2 rounded-md border-indigo-400"/>
                            <label htmlFor="pass">Contraseña:</label>
                            <input type="password" name="pass" id="pass" className="border-2 rounded-md border-indigo-400"/>
                            <label htmlFor="rep-pass">Repetir contraseña:</label>
                            <input type="password" name="rep-pass" id="rep-pass" className="border-2 rounded-md border-indigo-400"/>
                            <button type="submit" className="bg-purple-900 text-white text-center align-top mt-2 rounded-sm px-2 self-end">Registrarse</button>
                        </form>
                    </section>
                }
                <button onClick={() => setToggleForm(!toggleForm)} className="text-purple-900 mt-2">
                    {toggleForm ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
                </button>
            </div>
        </div>
    );
}

export default LoginModal;