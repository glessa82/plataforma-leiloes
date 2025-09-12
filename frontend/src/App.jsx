import { useState, useEffect } from 'react';
import AuctionsList from './AuctionsList';
import AuctionForm from './AuctionForm';

function App() {
  const [auctions, setAuctions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingAuction, setEditingAuction] = useState(null);
  const [filters, setFilters] = useState({ city: '', neighborhood: '', status: '' });

  const fetchAuctions = async () => {
    setIsLoading(true);
    setError(null);
    try {
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
  }, [filters]); // Adicionado `filters` para que a busca seja re-executada quando o filtro mudar.

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
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({ ...prevFilters, [name]: value }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchAuctions();
  };

  return (
    <div className="container mx-auto p-4 md:p-8 font-sans">
      <h1 className="text-3xl font-bold text-center my-6">Plataforma de Gestão de Leilões</h1>
      
      <AuctionForm 
        onAuctionAdded={handleAuctionAdded} 
        editingAuction={editingAuction}
        onAuctionUpdated={handleAuctionUpdated}
      />
      
      <hr className="my-10 border-gray-300" />
      
      <h2 className="text-2xl font-semibold mb-4">Filtrar Oportunidades</h2>
      <form onSubmit={handleFilterSubmit} className="mb-8 flex flex-wrap gap-4 items-center">
        <input 
          type="text" 
          name="city" 
          value={filters.city} 
          onChange={handleFilterChange} 
          placeholder="Filtrar por cidade" 
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 min-w-[150px]"
        />
        <input 
          type="text" 
          name="neighborhood" 
          value={filters.neighborhood} 
          onChange={handleFilterChange} 
          placeholder="Filtrar por bairro" 
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 min-w-[150px]"
        />
        <select 
          name="status" 
          value={filters.status} 
          onChange={handleFilterChange} 
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 min-w-[100px]"
        >
          <option value="">Status...</option>
          <option value="pending">Pendente</option>
          <option value="active">Ativo</option>
          <option value="won">Ganho</option>
          <option value="sold">Vendido</option>
        </select>
        <button type="submit" className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Aplicar Filtros
        </button>
      </form>

      <hr className="my-10 border-gray-300" />
      
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