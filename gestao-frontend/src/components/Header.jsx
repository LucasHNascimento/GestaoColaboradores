import { useNavigate, useLocation } from 'react-router-dom';

export default function Header({ titulo }) {
  const navigate = useNavigate();
  const location = useLocation(); // Permite saber em que página estamos

  const fazerLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  // Recupera o nível de acesso (Admin ou Colaborador)
  const role = localStorage.getItem('role');

  return (
    <header style={{ marginBottom: '32px' }}>
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' 
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>{titulo}</h1>
        <button className="btn btn-outline" onClick={fazerLogout} style={{ fontSize: '0.85rem' }}>
          Sair da Conta
        </button>
      </div>

      {/* Menu de Navegação Exclusivo para Administradores */}
      {role === 'Admin' && (
        <nav style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <button 
            onClick={() => navigate('/admin')} 
            // Se estiver na rota /admin, usa o botão preenchido; caso contrário, usa o outline
            className={`btn ${location.pathname === '/admin' ? '' : 'btn-outline'}`}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            Gestão de Pedidos
          </button>
          
          <button 
            onClick={() => navigate('/usuarios')} 
            className={`btn ${location.pathname === '/usuarios' ? '' : 'btn-outline'}`}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            Gestão de Colaboradores
          </button>
        </nav>
      )}
    </header>
  );
}