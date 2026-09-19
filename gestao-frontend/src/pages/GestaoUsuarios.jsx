import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import Header from '../components/Header';

export default function GestaoUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [role, setRole] = useState('Colaborador');

  const carregarUsuarios = async () => {
    try {
      const response = await api.get('/usuarios');
      setUsuarios(response.data);
    } catch (error) {
      toast.error('Erro ao carregar a lista de colaboradores.');
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const criarUsuario = async (e) => {
    e.preventDefault();
    try {
      await api.post('/usuarios', { nomeCompleto, email, senha, role });
      toast.success('Colaborador registado com sucesso!');
      
      // Limpa o formulário
      setNomeCompleto('');
      setEmail('');
      setSenha('');
      setRole('Colaborador');
      
      // Atualiza a tabela
      carregarUsuarios();
    } catch (error) {
      const mensagemErro = error.response?.data?.mensagem || 'Erro ao criar a conta.';
      toast.error(mensagemErro);
    }
  };

  const eliminarUsuario = async (id) => {
    if (!window.confirm('Tem a certeza que deseja eliminar permanentemente este colaborador?')) return;
    
    try {
      await api.delete(`/usuarios/${id}`);
      toast.success('Conta eliminada com sucesso.');
      carregarUsuarios();
    } catch (error) {
      const mensagemErro = error.response?.data?.mensagem || 'Erro ao eliminar o utilizador.';
      toast.error(mensagemErro);
    }
  };

  return (
    <div className="container">
      <Header titulo="Gestão de Colaboradores (Admin)" />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '32px' }}>
        
        {/* Lado Esquerdo: Formulário de Criação */}
        <section className="card" style={{ height: 'fit-content' }}>
          <h3 style={{ marginTop: 0, marginBottom: '24px', fontSize: '1.1rem' }}>Nova Conta</h3>
          
          <form onSubmit={criarUsuario}>
            <div className="form-group">
              <label className="form-label">Nome Completo</label>
              <input 
                type="text" className="form-input" placeholder="João Silva" 
                required value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} 
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">E-mail Corporativo</label>
              <input 
                type="email" className="form-input" placeholder="joao@empresa.com" 
                required value={email} onChange={(e) => setEmail(e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Palavra-passe Temporária</label>
              <input 
                type="password" className="form-input" placeholder="••••••••" 
                required value={senha} onChange={(e) => setSenha(e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nível de Acesso</label>
              <select className="form-input" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="Colaborador">Colaborador (Normal)</option>
                <option value="Admin">Administrador</option>
              </select>
            </div>
            
            <button type="submit" className="btn" style={{ width: '100%', marginTop: '8px' }}>
              Criar Colaborador
            </button>
          </form>
        </section>

        {/* Lado Direito: Tabela de Utilizadores */}
        <section className="card">
          <h3 style={{ marginTop: 0, marginBottom: '24px', fontSize: '1.1rem' }}>Contas Ativas no Sistema</h3>
          
          {usuarios.length === 0 ? (
             <p style={{ color: 'var(--text-muted)' }}>A carregar colaboradores...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Acesso</th>
                    <th style={{ textAlign: 'center' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map(usuario => (
                    <tr key={usuario.id}>
                      <td style={{ fontWeight: '500' }}>{usuario.nomeCompleto}</td>
                      <td>{usuario.email}</td>
                      <td>
                        <span className={`badge ${usuario.role === 'Admin' ? 'badge-pendente' : 'badge-aprovado'}`}>
                          {usuario.role}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          onClick={() => eliminarUsuario(usuario.id)} 
                          className="btn btn-outline" 
                          style={{ color: '#ef4444', borderColor: '#ef4444', padding: '6px 12px', fontSize: '0.8rem' }}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}