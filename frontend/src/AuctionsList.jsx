import { useState, useEffect } from 'react';

function AuctionList({ onEdit, onDelete, refreshAuctions, onSelectAuctionForEdit }) {
  const [auctions, setAuctions] = useState([]);
  const [selectedAuctions, setSelectedAuctions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAuctions();
  }, [refreshAuctions]);

  const fetchAuctions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3000/auctions');
      if (!response.ok) {
        throw new Error('Falha ao carregar os leilões.');
      }
      const data = await response.json();
      setAuctions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedAuctions(prevSelected => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter(auctionId => auctionId !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };

  const handleEditClick = () => {
    if (selectedAuctions.length === 1) {
      onSelectAuctionForEdit(selectedAuctions[0]);
    }
  };

  const handleDeleteClick = async () => {
    if (selectedAuctions.length === 0) return;

    if (window.confirm(`Tem certeza de que deseja excluir ${selectedAuctions.length} leilão(ões)?`)) {
      try {
        await Promise.all(selectedAuctions.map(id => 
          fetch(`http://localhost:3000/auctions/${id}`, { method: 'DELETE' })
        ));
        setSelectedAuctions([]);
        fetchAuctions();
        if (onDelete) {
          onDelete();
        }
      } catch (err) {
        setError("Falha ao excluir o(s) leilão(ões).");
      }
    }
  };

  if (loading) return <p className="text-center text-blue-500">A carregar leilões...</p>;
  if (error) return <p className="text-center text-red-500">Erro: {error}</p>;
  if (auctions.length === 0) return <p className="text-center text-gray-500">Nenhum leilão cadastrado.</p>;

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Lista de Oportunidades</h2>
      
      <div className="mb-4 flex gap-4">
        <button
          onClick={handleEditClick}
          disabled={selectedAuctions.length !== 1}
          className={`px-6 py-3 rounded-lg text-white font-semibold transition-colors ${selectedAuctions.length === 1 ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
        >
          Editar
        </button>
        <button
          onClick={handleDeleteClick}
          disabled={selectedAuctions.length === 0}
          className={`px-6 py-3 rounded-lg text-white font-semibold transition-colors ${selectedAuctions.length > 0 ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400 cursor-not-allowed'}`}
        >
          Excluir ({selectedAuctions.length})
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
              <th className="p-4 border-b-2 border-gray-200"></th> {/* Checkbox */}
              <th className="p-4 border-b-2 border-gray-200 hidden lg:table-cell">Título</th>
              <th className="p-4 border-b-2 border-gray-200">Cidade</th>
              <th className="p-4 border-b-2 border-gray-200 hidden md:table-cell">Bairro</th>
              <th className="p-4 border-b-2 border-gray-200 hidden md:table-cell">Endereço</th>
              <th className="p-4 border-b-2 border-gray-200">1ª Data</th>
              <th className="p-4 border-b-2 border-gray-200">1º Valor</th>
              <th className="p-4 border-b-2 border-gray-200">2ª Data</th>
              <th className="p-4 border-b-2 border-gray-200">2º Valor</th>
            </tr>
          </thead>
          <tbody>
            {auctions.map(auction => (
              <tr key={auction._id} className="text-sm text-gray-600 border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedAuctions.includes(auction._id)}
                    onChange={() => handleCheckboxChange(auction._id)}
                    className="form-checkbox h-4 w-4 text-blue-600 rounded"
                  />
                </td>
                <td className="p-4 hidden lg:table-cell">{auction.title}</td>
                <td className="p-4">{auction.location.city}</td>
                <td className="p-4 hidden md:table-cell">{auction.location.neighborhood}</td>
                <td className="p-4 hidden md:table-cell">{auction.location.fullAddress}</td>
                <td className="p-4">{new Date(auction.auctionInfo.firstAuction.date).toLocaleDateString()}</td>
                <td className="p-4">R$ {auction.auctionInfo.firstAuction.price.toLocaleString('pt-BR')}</td>
                <td className="p-4">{auction.auctionInfo.secondAuction?.date ? new Date(auction.auctionInfo.secondAuction.date).toLocaleDateString() : 'N/A'}</td>
                <td className="p-4">{auction.auctionInfo.secondAuction?.price ? `R$ ${auction.auctionInfo.secondAuction.price.toLocaleString('pt-BR')}` : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AuctionList;