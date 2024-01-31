import Cookies from 'js-cookie';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { api } from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [tokens, setTokens] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const data = Cookies.get('Ecrm@auth');
    const sessionData = sessionStorage.getItem('Ecrm@auth');

    if (data || sessionData) {
      const parsedData = JSON.parse(data || sessionData);

      setUser(parsedData.user);
      setTokens({
        accessToken: parsedData.accessToken,
        refreshToken: parsedData.refreshToken,
      });

      if (!sessionData) sessionStorage.setItem('Ecrm@auth', JSON.stringify(data));
    }

    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (username, password, keepSigned) => {
      try {
        const { data } = await api.post('login', { username, password });

        setUser(data.user);
        setTokens({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });
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

  const logout = useCallback(async () => {
    try {
      await api.put(
        'logout',
        { userId: user.id },
        {
          headers: {
            'x-access-token': tokens.accessToken,
          },
        },
      );

      setUser(null);
      setTokens(null);

      sessionStorage.removeItem('Ecrm@auth');
      Cookies.remove('Ecrm@auth');

      navigate('/');
    } catch (error) {
      throw new Error(error.response.data.error || error);
    }
  }, [navigate, tokens]); // eslint-disable-line

  const contextValue = useMemo(
    () => ({
      login,
      logout,
      tokens,
      user,
      isLoading,
    }),
    [login, logout, tokens, user, isLoading],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
