import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate();

  const carregarTickets = async () => {
    try {
      // Rota genérica para listar todos os tickets. Ajuste se a sua API usar outro caminho.
      const response = await api.get('/tickets'); 
      setTickets(response.data);
    } catch (error) {
      if (error.response?.status === 401) navigate('/login');
      else alert('Erro ao carregar tickets. Verifique as permissões.');
    }
  };

  useEffect(() => {
    carregarTickets();
  }, []);

  const alterarStatus = async (id, acao) => {
    try {
      // Chama os métodos Aprovar() ou Recusar() da sua entidade no C#
      await api.put(`/tickets/${id}/${acao}`); 
      carregarTickets(); // Atualiza a tabela imediatamente
    } catch (error) {
      alert(`Erro ao ${acao} o ticket.`);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: 'auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Gestão de Solicitações (Administrador)</h2>
        <button onClick={() => navigate('/login')} style={{ padding: '5px 15px', cursor: 'pointer' }}>Sair</button>
      </header>

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#333', color: 'white' }}>
            <th style={{ padding: '10px' }}>Solicitante (ID)</th>
            <th>Tipo</th>
            <th>Valor</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map(ticket => (
            <tr key={ticket.id} style={{ borderBottom: '1px solid #ccc' }}>
              <td style={{ padding: '10px' }}>{ticket.usuarioId.substring(0,8)}...</td>
              <td>{ticket.tipo === 1 ? 'Adiantamento' : 'Férias'}</td>
              <td>{ticket.valorSolicitado ? `R$ ${ticket.valorSolicitado}` : '-'}</td>
              <td>
                <strong>{ticket.status === 0 ? 'Pendente' : ticket.status === 1 ? 'Aprovado' : 'Recusado'}</strong>
              </td>
              <td>
                {ticket.status === 0 && (
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={() => alterarStatus(ticket.id, 'aprovar')} style={{ background: '#4CAF50', color: 'white', cursor: 'pointer' }}>Aprovar</button>
                    <button onClick={() => alterarStatus(ticket.id, 'recusar')} style={{ background: '#f44336', color: 'white', cursor: 'pointer' }}>Recusar</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}