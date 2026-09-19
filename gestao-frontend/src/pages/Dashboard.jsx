import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [tipo, setTipo] = useState(1); // 1 = Adiantamento Salarial, 0 = Férias
  const [valor, setValor] = useState('');
  const navigate = useNavigate();

  const carregarTickets = async () => {
    try {
      const response = await api.get('/tickets/meus-tickets');
      setTickets(response.data);
    } catch (error) {
      if (error.response?.status === 401) navigate('/login');
    }
  };

  useEffect(() => {
    carregarTickets();
  }, []);

  const solicitarTicket = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tickets/solicitar', {
        tipo: Number(tipo),
        valor: tipo === 1 ? parseFloat(valor) : null
      });
      alert('Solicitação enviada com sucesso!');
      setValor('');
      carregarTickets(); 
    } catch (error) {
      alert('Erro ao enviar solicitação.');
    }
  };

  const fazerLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>Painel do Colaborador</h2>
        <button onClick={fazerLogout} style={{ padding: '5px 15px', cursor: 'pointer' }}>Sair</button>
      </header>

      <section style={{ marginTop: '30px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Nova Solicitação</h3>
        <form onSubmit={solicitarTicket} style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <select value={tipo} onChange={(e) => setTipo(Number(e.target.value))} style={{ padding: '8px' }}>
            <option value={1}>Adiantamento Salarial</option>
            <option value={0}>Férias</option>
          </select>
          
          {tipo === 1 && (
            <input 
              type="number" placeholder="Valor (R$)" required 
              value={valor} onChange={(e) => setValor(e.target.value)} 
              style={{ padding: '8px' }}
            />
          )}
          <button type="submit" style={{ padding: '8px 15px', cursor: 'pointer' }}>Enviar Ticket</button>
        </form>
      </section>

      <section style={{ marginTop: '40px' }}>
        <h3>Meu Histórico</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {tickets.map(ticket => (
            <li key={ticket.id} style={{ marginBottom: '10px', padding: '10px', background: '#eee', borderRadius: '4px' }}>
              <strong>{ticket.tipo === 1 ? 'Adiantamento' : 'Férias'}</strong> - 
              Status: {ticket.status === 0 ? 'Pendente' : ticket.status === 1 ? 'Aprovado' : 'Recusado'}
              {ticket.valorSolicitado && ` - R$ ${ticket.valorSolicitado}`}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}