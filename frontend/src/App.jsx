import { useState, useEffect } from 'react';
import AuctionsList from './AuctionsList';
import AuctionForm from './AuctionForm';

function App() {
  const [auctions, setAuctions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingAuction, setEditingAuction] = useState(null);

  // 1. Novo estado para os filtros
  const [filters, setFilters] = useState({
    city: '',
    neighborhood: '',
    status: ''
  });

  // 2. Função de busca agora aceita filtros
  const fetchAuctions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Constrói os parâmetros de busca
      const params = new URLSearchParams(filters).toString();
      const url = `http://localhost:3000/auctions?${params}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Falha ao buscar os dados.');
      }
      const data = await response.json();
      setAuctions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  const handleAuctionAdded = () => {
    fetchAuctions();
  };
  
  const handleAuctionDeleted = () => {
    fetchAuctions();
  };
  
  const handleAuctionEdit = (auction) => {
    setEditingAuction(auction);
  };
  
  const handleAuctionUpdated = () => {
    setEditingAuction(null);
    fetchAuctions();
  };
  
  // 3. Funções para lidar com as mudanças e envio dos filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchAuctions(); // Chama a função de busca com os novos filtros
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>Plataforma de Gestão de Leilões</h1>
      
      {/* Formulário de cadastro/edição */}
      <AuctionForm 
        onAuctionAdded={handleAuctionAdded} 
        editingAuction={editingAuction}
        onAuctionUpdated={handleAuctionUpdated}
      />
      
      <hr style={{ margin: '40px 0' }} />
      
      {/* 4. Novo formulário para os filtros */}
      <h2>Filtrar Oportunidades</h2>
      <form onSubmit={handleFilterSubmit} style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          name="city" 
          value={filters.city} 
          onChange={handleFilterChange} 
          placeholder="Filtrar por cidade" 
          style={{ marginRight: '10px', padding: '8px' }}
        />
        <input 
          type="text" 
          name="neighborhood" 
          value={filters.neighborhood} 
          onChange={handleFilterChange} 
          placeholder="Filtrar por bairro" 
          style={{ marginRight: '10px', padding: '8px' }}
        />
        <select 
          name="status" 
          value={filters.status} 
          onChange={handleFilterChange} 
          style={{ marginRight: '10px', padding: '8px' }}
        >
          <option value="">Status...</option>
          <option value="pending">Pendente</option>
          <option value="active">Ativo</option>
          <option value="won">Ganho</option>
          <option value="sold">Vendido</option>
        </select>
        <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Aplicar Filtros
        </button>
      </form>

      <hr style={{ margin: '40px 0' }} />
      
      {/* Lista de leilões */}
      <AuctionsList 
        auctions={auctions} 
        isLoading={isLoading} 
        error={error} 
        onAuctionDeleted={handleAuctionDeleted} 
        onAuctionEdit={handleAuctionEdit}
      />
    </div>
  );
}

export default App;