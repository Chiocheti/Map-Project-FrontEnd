import Cookies from 'js-cookie';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { api } from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [client, setClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const data = Cookies.get('user@auth');
    const sessionData = sessionStorage.getItem('user@auth');

    if (data || sessionData) {
      const parsedData = JSON.parse(data || sessionData);

      setUser(parsedData.user);

      if (!sessionData) sessionStorage.setItem('Ecrm@auth', JSON.stringify(data));
    }

    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (username, password, keepSigned) => {
      try {
        const { data } = await api.post('login', { username, password });

        setUser(data.user);

        sessionStorage.setItem('Ecrm@auth', JSON.stringify(data));

        if (keepSigned) {
          Cookies.set('Ecrm@auth', JSON.stringify(data));
        }

        const { roles } = data.user;

        if (roles[0] === 'Administrativo') {
          navigate('/admin');
          return null;
        }

        if (roles[0] === 'Calendario') {
          navigate('/calendar');
          return null;
        }

        if (roles[0] === 'Financeiro') {
          navigate('/financier');
          return null;
        }

        if (roles[0] === 'Relatório') {
          navigate('/report');
          return null;
        }

        if (roles[0] === 'Setor de Serviços') {
          navigate('/services');
          return null;
        }

        if (roles[0] === 'Setor de Sócios') {
          navigate('/form');
          return null;
        }

        if (roles[0] === 'Setor Médico') {
          navigate('/refunds');
          return null;
        }

        return null;
      } catch (error) {
        throw new Error(error.response.data.error);
      }
    },
    [navigate],
  );

  const clientLogin = useCallback(
    async (name, cpf) => {
      const data = { name, cpf };
      setClient(data);

      sessionStorage.setItem('MapingClient@auth', JSON.stringify(data));

      navigate('/saveMarket');
    },
    [navigate],
  );
  const clientLogout = useCallback(async () => {
    setClient(null);

    sessionStorage.removeItem('MapingClient@auth');

    navigate('/');
  }, [navigate]);

  const logout = useCallback(async () => {
    setUser(null);

    sessionStorage.removeItem('Ecrm@auth');
    Cookies.remove('Ecrm@auth');

    navigate('/');
  }, [navigate]); // eslint-disable-line

  const contextValue = useMemo(
    () => ({
      login,
      logout,
      clientLogin,
      clientLogout,
      client,
      user,
      isLoading,
    }),
    [login, logout, clientLogin, clientLogout, client, user, isLoading],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
