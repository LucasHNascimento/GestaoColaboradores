import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import Header from '../components/Header';

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);

  const carregarTickets = async () => {
    try {
      const response = await api.get('/tickets'); 
      setTickets(response.data);
    } catch (error) {
      if (error.response?.status === 401) window.location.href = '/login';
      else toast.error('Erro ao carregar pedidos. Verifique as suas permissões.');
    }
  };

  useEffect(() => {
    carregarTickets();
  }, []);

  const alterarStatus = async (id, acao) => {
    try {
      await api.put(`/tickets/${id}/${acao}`); 
      toast.success(`Pedido ${acao === 'aprovar' ? 'aprovado' : 'recusado'} com sucesso!`);
      carregarTickets(); 
    } catch (error) {
      toast.error(`Erro ao ${acao} o pedido.`);
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
      <Header titulo="Gestão de Solicitações" />

      <section className="card">
        {tickets.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px 0' }}>Não existem pedidos no sistema.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Colaborador (ID)</th>
                  <th>Tipo de Pedido</th>
                  <th>Valor</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(ticket => (
                  <tr key={ticket.id}>
                    <td style={{ fontWeight: '500' }}>{ticket.usuarioId.substring(0,8)}...</td>
                    <td>{ticket.tipo === 1 ? 'Adiantamento' : 'Férias'}</td>
                    <td>{ticket.valorSolicitado ? `R$ ${ticket.valorSolicitado.toFixed(2)}` : '-'}</td>
                    <td>{getStatusBadge(ticket.status)}</td>
                    <td style={{ textAlign: 'center' }}>
                      {ticket.status === 0 ? (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button onClick={() => alterarStatus(ticket.id, 'aprovar')} className="btn btn-success">
                            Aprovar
                          </button>
                          <button onClick={() => alterarStatus(ticket.id, 'recusar')} className="btn btn-danger">
                            Recusar
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Finalizado</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}