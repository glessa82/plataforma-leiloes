import { useState, useEffect } from 'react';

function AuctionForm({ onAuctionAdded, editingAuction, onAuctionUpdated }) {
  const [formData, setFormData] = useState({
    title: '',
    location: { city: '', neighborhood: '', fullAddress: '' },
    auctionInfo: { adLink: '', firstAuction: { date: '', price: '' } }
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // 1. O 'useEffect' para pré-preencher o formulário se estiver em modo de edição
  useEffect(() => {
    if (editingAuction) {
      // Formata a data para o campo de input
      const formattedDate = new Date(editingAuction.auctionInfo.firstAuction.date).toISOString().slice(0, 16);
      
      setFormData({
        ...editingAuction,
        auctionInfo: {
          ...editingAuction.auctionInfo,
          firstAuction: {
            ...editingAuction.auctionInfo.firstAuction,
            date: formattedDate
          }
        }
      });
    } else {
      // Limpa o formulário se não houver leilão para editar
      setFormData({
        title: '',
        location: { city: '', neighborhood: '', fullAddress: '' },
        auctionInfo: { adLink: '', firstAuction: { date: '', price: '' } }
      });
    }
  }, [editingAuction]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const [mainKey, subKey, subKey2] = name.split('.');

    if (subKey2) {
      setFormData(prevData => ({
        ...prevData,
        [mainKey]: {
          ...prevData[mainKey],
          [subKey]: {
            ...prevData[mainKey][subKey],
            [subKey2]: value
          }
        }
      }));
    } else if (subKey) {
      setFormData(prevData => ({
        ...prevData,
        [mainKey]: {
          ...prevData[mainKey],
          [subKey]: value
        }
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const url = editingAuction 
        ? `http://localhost:3000/auctions/${editingAuction._id}` 
        : 'http://localhost:3000/auctions';
      const method = editingAuction ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`Falha ao ${editingAuction ? 'atualizar' : 'cadastrar'} o leilão.`);
      }
      
      setSuccess(true);
      
      // Chamada da função de callback
      if (editingAuction) {
        onAuctionUpdated();
      } else {
        onAuctionAdded();
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // 2. Condição para exibir os botões de ação
  const formTitle = editingAuction ? 'Editar Leilão' : 'Cadastrar Nova Oportunidade';

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '20px' }}>
      <h2>{formTitle}</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Título:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        
        <h3>Localização</h3>
        <div style={{ marginBottom: '10px' }}>
          <label>Cidade:</label>
          <input
            type="text"
            name="location.city"
            value={formData.location.city}
            onChange={handleInputChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Bairro:</label>
          <input
            type="text"
            name="location.neighborhood"
            value={formData.location.neighborhood}
            onChange={handleInputChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Endereço Completo:</label>
          <input
            type="text"
            name="location.fullAddress"
            value={formData.location.fullAddress}
            onChange={handleInputChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <h3>Informações do Leilão</h3>
        <div style={{ marginBottom: '10px' }}>
          <label>Link do Anúncio:</label>
          <input
            type="text"
            name="auctionInfo.adLink"
            value={formData.auctionInfo.adLink}
            onChange={handleInputChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Data/Hora do 1º Leilão:</label>
          <input
            type="datetime-local"
            name="auctionInfo.firstAuction.date"
            value={formData.auctionInfo.firstAuction.date}
            onChange={handleInputChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Valor do 1º Leilão:</label>
          <input
            type="number"
            name="auctionInfo.firstAuction.price"
            value={formData.auctionInfo.firstAuction.price}
            onChange={handleInputChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button type="submit" disabled={loading} style={{ padding: '10px 15px', backgroundColor: loading ? '#ccc' : '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            {loading ? 'Processando...' : (editingAuction ? 'Atualizar' : 'Cadastrar Leilão')}
          </button>
          
          {editingAuction && (
            <button
              type="button"
              onClick={() => onAuctionUpdated()}
              style={{ padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {success && <p style={{ color: 'green', marginTop: '10px' }}>Leilão {editingAuction ? 'atualizado' : 'cadastrado'} com sucesso!</p>}
      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
    </div>
  );
}

export default AuctionForm;