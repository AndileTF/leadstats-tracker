
import { useNavigate, useEffect } from 'react';

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to team-overview page to avoid 404
    navigate('/team-overview');
  }, [navigate]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirecting to team overview...</p>
    </div>
  );
};

export default Index;
