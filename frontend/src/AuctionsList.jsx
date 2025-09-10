function AuctionsList({ auctions, isLoading, error, onAuctionDeleted, onAuctionEdit }) {
  if (isLoading) {
    return <p>Carregando leilões...</p>;
  }

  if (error) {
    return <p>Ocorreu um erro: {error}</p>;
  }

  // 1. Função para lidar com a exclusão
  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este leilão?')) {
      try {
        const response = await fetch(`http://localhost:3000/auctions/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Falha ao excluir o leilão.');
        }
        // Notifica o componente pai sobre a exclusão
        if (onAuctionDeleted) {
          onAuctionDeleted();
        }
      } catch (err) {
        console.error("Erro ao excluir:", err);
        alert('Erro ao excluir o leilão.');
      }
    }
  };

  return (
    <div>
      <h2>Oportunidades de Leilões</h2>
      {auctions.length > 0 ? (
        <ul>
          {auctions.map(auction => (
            <li key={auction._id}>
              <h3>{auction.title}</h3>
              <p>Cidade: {auction.location.city}</p>
              <p>Endereço: {auction.location.fullAddress}</p>
              <p>Data do 1º Leilão: {new Date(auction.auctionInfo.firstAuction.date).toLocaleDateString()}</p>
              <p>Valor Inicial: R$ {auction.auctionInfo.firstAuction.price.toLocaleString('pt-BR')}</p>
              
              {/* 2. Adiciona os botões de ação */}
              <div style={{ marginTop: '10px' }}>
                <button 
                  onClick={() => onAuctionEdit(auction)}
                  style={{ marginRight: '10px', padding: '5px 10px' }}
                >
                  Editar
                </button>
                <button 
                  onClick={() => handleDelete(auction._id)}
                  style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none' }}
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhum leilão cadastrado ainda.</p>
      )}
    </div>
  );
}

export default AuctionsList;