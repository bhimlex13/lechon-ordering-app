import React, { createContext, useReducer, useEffect, useContext } from 'react';
import api from '../api'; 

const initialState = {
  userInfo: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null,
  loading: false,
  error: null,
};

export const AuthContext = createContext(initialState);

export const useAuth = () => useContext(AuthContext);

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_REQUEST':
    case 'REGISTER_REQUEST':
    case 'UPDATE_PROFILE_REQUEST': 
      return { ...state, loading: true, error: null };
    
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
    case 'UPDATE_PROFILE_SUCCESS': 
      return { ...state, loading: false, userInfo: action.payload, error: null };
    
    case 'LOGIN_FAIL':
    case 'REGISTER_FAIL':
    case 'UPDATE_PROFILE_FAIL': 
      return { ...state, loading: false, error: action.payload };
    
    case 'LOGOUT':
      return { ...state, loading: false, error: null, userInfo: null };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Sync state with localStorage
  useEffect(() => {
    if (state.userInfo) {
      localStorage.setItem('userInfo', JSON.stringify(state.userInfo));
    } else {
      localStorage.removeItem('userInfo');
    }
  }, [state.userInfo]);

  const login = async (email, password) => {
    try {
      dispatch({ type: 'LOGIN_REQUEST' });
      const { data } = await api.post('/api/auth/login', { email, password });
      dispatch({ type: 'LOGIN_SUCCESS', payload: data });
      return { success: true, role: data.role }; 
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      dispatch({ type: 'LOGIN_FAIL', payload: msg });
      return { success: false, message: msg };
    }
  };

  const register = async (name, email, password, phone) => {
    try {
      dispatch({ type: 'REGISTER_REQUEST' });
      const { data } = await api.post('/api/auth/register', { name, email, password, phone });
      dispatch({ type: 'REGISTER_SUCCESS', payload: data });
      return { success: true }; 
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      dispatch({ type: 'REGISTER_FAIL', payload: msg });
      return { success: false, message: msg }; 
    }
  };

  const updateProfile = async (userUpdates) => {
    try {
      dispatch({ type: 'UPDATE_PROFILE_REQUEST' });
      const { data } = await api.put('/api/users/profile', userUpdates);
      const updatedUserInfo = { ...state.userInfo, ...data }; 
      dispatch({ type: 'UPDATE_PROFILE_SUCCESS', payload: updatedUserInfo });
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      dispatch({ type: 'UPDATE_PROFILE_FAIL', payload: msg });
      throw error; 
    }
  };

  const updateUserState = (userData) => {
      const updatedUserInfo = { ...state.userInfo, ...userData };
      dispatch({ type: 'UPDATE_PROFILE_SUCCESS', payload: updatedUserInfo });
  };

  const logout = () => {
    // UPDATED: Force removal immediately before dispatching or reloading
    localStorage.removeItem('userInfo'); 
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, updateProfile, updateUserState, logout }}>
      {children}
    </AuthContext.Provider>
  );
};