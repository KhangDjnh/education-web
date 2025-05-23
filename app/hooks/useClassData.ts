import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { classService } from '../services/classService';
import type { ClassData } from '../types/class';

export const useClassData = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken, validateSession } = useAuth();

  useEffect(() => {
    const checkAuthAndLoadClass = async () => {
      try {
        setLoading(true);
        console.log('Class page mounted, checking auth for class ID:', id);

        const isSessionValid = await validateSession();
        console.log('Session valid:', isSessionValid);

        if (!isSessionValid) {
          console.log('Session invalid, storing redirect path and navigating to signin');
          sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
          navigate('/signin');
          return;
        }

        await fetchClassData();
      } catch (err) {
        console.error('Error in checkAuthAndLoadClass:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadClass();
  }, [id, validateSession, navigate]);

  const fetchClassData = async () => {
    try {
      console.log('Fetching class data for ID:', id);
      const token = getToken();

      if (!token) {
        throw new Error('Authentication token not found');
      }

      console.log('Making API request to fetch class details');
      const data = await classService.getClassData(id!, token);
      setClassData(data);
    } catch (err) {
      console.error('Error fetching class data:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  return {
    classData,
    loading,
    error,
    refetch: fetchClassData,
  };
}; 