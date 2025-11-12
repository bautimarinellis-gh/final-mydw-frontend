import { Routes, Route, Navigate } from 'react-router-dom';
import { DiscoverPage, MatchesPage, ProfilePage, RegisterPage, LoginPage } from '../pages';

const AppRouter = () => {
  return (
    <Routes>
      {/* Ruta por defecto - redirigir a discover */}
      <Route path="/" element={<Navigate to="/discover" replace />} />

      {/* Rutas públicas (sin protección por ahora) */}
      <Route path="/discover" element={<DiscoverPage />} />
      <Route path="/matches" element={<MatchesPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* 404 - Ruta no encontrada */}
      <Route path="*" element={<Navigate to="/discover" replace />} />
    </Routes>
  );
};

export default AppRouter;

