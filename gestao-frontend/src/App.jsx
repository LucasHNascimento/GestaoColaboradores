import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Importação das páginas
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import GestaoUsuarios from './pages/GestaoUsuarios'; // 1. Importe o novo componente

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirecionamento inicial */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Rotas Públicas */}
        <Route path="/login" element={<Login />} />
        
        {/* Rotas do Colaborador */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Rotas do Administrador */}
        <Route path="/admin" element={<AdminDashboard />} />
        
        {/* 2. Adicione a rota para a gestão de utilizadores */}
        <Route path="/usuarios" element={<GestaoUsuarios />} />
      </Routes>
    </BrowserRouter>
  );
}