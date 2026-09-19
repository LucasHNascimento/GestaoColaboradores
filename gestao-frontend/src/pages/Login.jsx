import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { email, senha });
      
      // Guarda o token e o nível de acesso
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role); // Adicione esta linha!
      
      // Redireciona consoante o perfil
      if (response.data.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
      
    } catch (error) {
      toast.error('Falha na autenticação. Verifique as suas credenciais.');
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '40px 30px' }}>
        <h2 style={{ marginTop: 0, textAlign: 'center', marginBottom: '30px', fontSize: '1.5rem', color: 'var(--primary)' }}>
          Acesso ao Sistema
        </h2>
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">E-mail corporativo</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="email@empresa.com" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Palavra-passe</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="••••••••" 
              required 
              value={senha}
              onChange={(e) => setSenha(e.target.value)} 
            />
          </div>
          
          <button type="submit" className="btn" style={{ width: '100%', marginTop: '16px', padding: '12px' }}>
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}