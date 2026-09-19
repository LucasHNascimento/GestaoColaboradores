import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import Header from '../components/Header';

export default function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [tipo, setTipo] = useState(1);
  const [valor, setValor] = useState('');

  const carregarTickets = async () => {
    try {
      const response = await api.get('/tickets/meus-tickets');
      setTickets(response.data);
    } catch (error) {
      if (error.response?.status === 401) window.location.href = '/login';
    }
  };

  useEffect(() => { carregarTickets(); }, []);

  const solicitarTicket = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tickets/solicitar', {
        tipo: Number(tipo),
        valor: tipo === 1 ? parseFloat(valor) : null
      });
      toast.success('Pedido registado com sucesso.');
      setValor('');
      carregarTickets(); 
    } catch (error) {
      const mensagemErro = error.response?.data?.mensagem || 'Ocorreu um erro ao registar o pedido.';
      toast.error(mensagemErro);
    }
  };

  const getStatusBadge = (status) => {
    const props = {
      0: { classe: 'badge-pendente', texto: 'Pendente' },
      1: { classe: 'badge-aprovado', texto: 'Aprovado' },
      2: { classe: 'badge-recusado', texto: 'Recusado' }
    };
    const atual = props[status] || props[0];
    return <span className={`badge ${atual.classe}`}>{atual.texto}</span>;
  };

  return (
    <div className="container">
      <Header titulo="Painel do Colaborador" />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '32px' }}>
        
        <section className="card" style={{ height: 'fit-content' }}>
          <h3 style={{ marginTop: 0, marginBottom: '24px', fontSize: '1.1rem' }}>Nova Solicitação</h3>
          
          <form onSubmit={solicitarTicket}>
            <div className="form-group">
              <label className="form-label">Tipo de Pedido</label>
              <select className="form-input" value={tipo} onChange={(e) => setTipo(Number(e.target.value))}>
                <option value={1}>Adiantamento Salarial</option>
                <option value={0}>Férias</option>
              </select>
            </div>
            
            {tipo === 1 && (
              <div className="form-group">
                <label className="form-label">Valor do Adiantamento (R$)</label>
                <input 
                  type="number" className="form-input" placeholder="0.00" 
                  required value={valor} onChange={(e) => setValor(e.target.value)} 
                />
              </div>
            )}
            
            <button type="submit" className="btn" style={{ width: '100%', marginTop: '8px' }}>
              Submeter Pedido
            </button>
          </form>
        </section>

        <section className="card">
          <h3 style={{ marginTop: 0, marginBottom: '24px', fontSize: '1.1rem' }}>Histórico de Registos</h3>
          
          {tickets.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Sem histórico de pedidos.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {tickets.map(ticket => (
                <div key={ticket.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '1rem' }}>
                      {ticket.tipo === 1 ? 'Adiantamento Salarial' : 'Férias'}
                    </strong>
                    {ticket.valorSolicitado && (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px', display: 'block' }}>
                        Valor solicitado: R$ {ticket.valorSolicitado.toFixed(2)}
                      </span>
                    )}
                  </div>
                  {getStatusBadge(ticket.status)}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}