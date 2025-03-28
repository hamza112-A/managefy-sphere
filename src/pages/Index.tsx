
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

// Redirect to the Home page
const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/');
  }, [navigate]);
  
  return null;
};

export default Index;
