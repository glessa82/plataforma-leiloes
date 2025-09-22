import { useState, useEffect } from 'react';
import AuctionForm from './AuctionForm';
import AuctionsList from './AuctionsList';
import AuctionDetails from './AuctionDetails';
import Filters from './Filters';
import Header from './Header';
import AuthForm from './AuthForm';
import UserRegistrationForm from './components/UserRegistrationForm'; 

function App() {
  const [refreshAuctions, setRefreshAuctions] = useState(false);
  const [editingAuction, setEditingAuction] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedAuctionId, setSelectedAuctionId] = useState(null);
  const [auctions, setAuctions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    city: '',
    status: '',
    minPrice: '',
    maxPrice: ''
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isUserFormVisible, setIsUserFormVisible] = useState(false);

  const fetchAuctions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams(filters).toString();
      const response = await fetch(`http://localhost:3000/auctions?${query}`);
      if (!response.ok) {
        throw new Error('Falha ao carregar os leilões.');
      }
      const data = await response.json();
      setAuctions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    fetchAuctions();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setEditingAuction(null);
    setIsFormVisible(false);
    setSelectedAuctionId(null);
    setIsUserFormVisible(false);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    fetchAuctions();
  }, [refreshAuctions, filters]);

  const handleEdit = (auctionId) => {
    const auctionToEdit = auctions.find(a => a._id === auctionId);
    setEditingAuction(auctionToEdit);
    setIsFormVisible(true);
    setSelectedAuctionId(null);
    setIsUserFormVisible(false);
  };

  const handleViewDetails = (auctionId) => {
    setSelectedAuctionId(auctionId);
    setEditingAuction(null);
    setIsFormVisible(false);
    setIsUserFormVisible(false);
  };

  const handleBackToList = () => {
    setSelectedAuctionId(null);
    setEditingAuction(null);
    setIsFormVisible(false);
    setIsUserFormVisible(false);
  };

  const handleDelete = async (auctionId) => {
    if (window.confirm('Tem certeza de que deseja excluir este leilão?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/auctions/${auctionId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Falha ao excluir o leilão.');
        }
        setSelectedAuctionId(null);
        setRefreshAuctions(!refreshAuctions);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleNewUserClick = () => {
    setIsUserFormVisible(true);
    setIsFormVisible(false);
    setSelectedAuctionId(null);
  };
  
  const currentAuction = selectedAuctionId ? auctions.find(a => a._id === selectedAuctionId) : null;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      <main className="container mx-auto p-4 max-w-7xl w-full">
        {!isAuthenticated ? (
          <AuthForm onAuthSuccess={handleAuthSuccess} />
        ) : (
          <>
            {!isFormVisible && !selectedAuctionId && !isUserFormVisible && (
              <div className="flex justify-end mb-4 gap-2">
                <button
                  onClick={() => {
                    setIsFormVisible(true);
                    setEditingAuction(null);
                    setIsUserFormVisible(false);
                  }}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                >
                  Adicionar Novo Leilão
                </button>
                <button
                  onClick={handleNewUserClick}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                >
                  Cadastrar Novo Usuário
                </button>
              </div>
            )}

            {isUserFormVisible ? (
              <UserRegistrationForm/>
            ) : isFormVisible ? (
              <AuctionForm
                onAuctionAdded={() => {
                  setIsFormVisible(false);
                  setRefreshAuctions(!refreshAuctions);
                }}
                editingAuction={editingAuction}
                onAuctionUpdated={() => {
                  setIsFormVisible(false);
                  setEditingAuction(null);
                  setRefreshAuctions(!refreshAuctions);
                }}
              />
            ) : selectedAuctionId ? (
              <AuctionDetails 
                auction={currentAuction} 
                onBackToList={handleBackToList}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ) : (
              <>
                <Filters filters={filters} onFilterChange={setFilters} onSearch={fetchAuctions} />
                <AuctionsList
                  auctions={auctions}
                  isLoading={isLoading}
                  error={error}
                  onEdit={handleEdit}
                  onDelete={() => setRefreshAuctions(!refreshAuctions)}
                  onViewDetails={handleViewDetails}
                />
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;