import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { hashPassword } from '../utils/helpers';
import { v4 as uuidv4 } from 'uuid'; // We might need this for UUIDs or let Supabase generate them. Let's let Supabase generate them using gen_random_uuid() in schema. Wait, we are just inserting.

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem('tecnoinnova_session');
    if (session) {
      setUser(JSON.parse(session));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const hashed = await hashPassword(password);
    
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('password', hashed)
      .single();

    if (error || !data) {
      throw new Error('Credenciales inválidas');
    }

    if (data.activo === false) {
      throw new Error('Su cuenta ha sido desactivada');
    }

    const session = {
      id: data.id,
      nombre: data.nombre,
      apellido: data.apellido,
      email: data.email,
      rol: data.rol
    };

    localStorage.setItem('tecnoinnova_session', JSON.stringify(session));
    setUser(session);
    return session;
  };

  const register = async (userData) => {
    const { nombre, apellido, email, password, rol = 'usuario' } = userData;
    const hashed = await hashPassword(password);

    // Verificar si existe
    const { data: existing } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      throw new Error('El correo ya está registrado');
    }

    const { data, error } = await supabase
      .from('usuarios')
      .insert([
        {
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          email: email.toLowerCase().trim(),
          password: hashed,
          rol: rol,
          activo: true
        }
      ])
      .select()
      .single();

    if (error) {
      throw new Error('Error al registrar usuario: ' + error.message);
    }
    
    return data;
  };

  const logout = () => {
    localStorage.removeItem('tecnoinnova_session');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isAdmin: user?.rol === 'admin',
      loading,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
