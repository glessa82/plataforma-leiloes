import { useState, useEffect } from 'react';

function AuctionForm({ onAuctionAdded, editingAuction, onAuctionUpdated }) {
  const [formData, setFormData] = useState({
    title: '',
    location: { city: '', neighborhood: '', fullAddress: '' },
    auctionInfo: { adLink: '', firstAuction: { date: '', price: '' }, secondAuction: { date: '', price: '' } },
    biddingInfo: { acquisitionPrice: 0, leiloeiroCommission: 0, itbiValue: 0, registrationFee: 0, lawyerFee: 0, renovationCost: 0, additionalCosts: 0 },
    postAcquisitionCosts: { maintenancePeriodInMonths: 0, monthlyIptu: 0, monthlyCondoFee: 0, otherMonthlyCosts: 0 },
    saleInfo: { salePrice: 0, brokerCommission: 0, incomeTaxOnSale: 0 },
    status: 'pending'
  });
  
  const [totalProfit, setTotalProfit] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (editingAuction) {
      const formatDateTime = (dateString) => dateString ? new Date(dateString).toISOString().slice(0, 16) : '';
      
      setFormData({
        ...editingAuction,
        location: editingAuction.location || {},
        auctionInfo: {
          ...(editingAuction.auctionInfo || {}),
          firstAuction: {
            ...(editingAuction.auctionInfo?.firstAuction || {}),
            date: formatDateTime(editingAuction.auctionInfo?.firstAuction?.date)
          },
          secondAuction: {
            ...(editingAuction.auctionInfo?.secondAuction || {}),
            date: formatDateTime(editingAuction.auctionInfo?.secondAuction?.date)
          }
        },
        biddingInfo: editingAuction.biddingInfo || { acquisitionPrice: 0, leiloeiroCommission: 0, itbiValue: 0, registrationFee: 0, lawyerFee: 0, renovationCost: 0, additionalCosts: 0 },
        postAcquisitionCosts: editingAuction.postAcquisitionCosts || { maintenancePeriodInMonths: 0, monthlyIptu: 0, monthlyCondoFee: 0, otherMonthlyCosts: 0 },
        saleInfo: editingAuction.saleInfo || { salePrice: 0, brokerCommission: 0, incomeTaxOnSale: 0 },
        status: editingAuction.status || 'pending',
      });
    } else {
      setFormData({
        title: '',
        location: { city: '', neighborhood: '', fullAddress: '' },
        auctionInfo: { adLink: '', firstAuction: { date: '', price: '' }, secondAuction: { date: '', price: '' } },
        biddingInfo: { acquisitionPrice: 0, leiloeiroCommission: 0, itbiValue: 0, registrationFee: 0, lawyerFee: 0, renovationCost: 0, additionalCosts: 0 },
        postAcquisitionCosts: { maintenancePeriodInMonths: 0, monthlyIptu: 0, monthlyCondoFee: 0, otherMonthlyCosts: 0 },
        saleInfo: { salePrice: 0, brokerCommission: 0, incomeTaxOnSale: 0 },
        status: 'pending'
      });
    }
  }, [editingAuction]);

  useEffect(() => {
    const calculateProfit = () => {
      const { biddingInfo, postAcquisitionCosts, saleInfo } = formData;
      
      const totalCost = 
        (parseFloat(biddingInfo.acquisitionPrice) || 0) + 
        (parseFloat(biddingInfo.leiloeiroCommission) || 0) +
        (parseFloat(biddingInfo.itbiValue) || 0) +
        (parseFloat(biddingInfo.registrationFee) || 0) +
        (parseFloat(biddingInfo.lawyerFee) || 0) +
        (parseFloat(biddingInfo.renovationCost) || 0) +
        (parseFloat(biddingInfo.additionalCosts) || 0) +
        ((parseFloat(postAcquisitionCosts.maintenancePeriodInMonths) || 0) * (
          (parseFloat(postAcquisitionCosts.monthlyIptu) || 0) +
          (parseFloat(postAcquisitionCosts.monthlyCondoFee) || 0) +
          (parseFloat(postAcquisitionCosts.otherMonthlyCosts) || 0)
        ));
        
      const totalSale = 
        (parseFloat(saleInfo.salePrice) || 0) -
        (parseFloat(saleInfo.brokerCommission) || 0) -
        (parseFloat(saleInfo.incomeTaxOnSale) || 0);
      
      const profit = totalSale - totalCost;
      setTotalProfit(profit);
    };

    calculateProfit();
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    const [mainKey, subKey, subKey2] = name.split('.');

    let finalValue = value;
    if (type === 'number') {
      finalValue = parseFloat(value);
      if (isNaN(finalValue)) finalValue = 0;
    }

    if (subKey2) {
      setFormData(prevData => ({
        ...prevData,
        [mainKey]: {
          ...prevData[mainKey],
          [subKey]: {
            ...prevData[mainKey][subKey],
            [subKey2]: finalValue
          }
        }
      }));
    } else if (subKey) {
      setFormData(prevData => ({
        ...prevData,
        [mainKey]: {
          ...prevData[mainKey],
          [subKey]: finalValue
        }
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: finalValue
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        ...formData,
        profit: totalProfit
      };
      
      const url = editingAuction 
        ? `http://localhost:3000/auctions/${editingAuction._id}` 
        : 'http://localhost:3000/auctions';
      const method = editingAuction ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Falha ao ${editingAuction ? 'atualizar' : 'cadastrar'} o leilão.`);
      }
      
      setSuccess(true);
      
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
  
  const formTitle = editingAuction ? 'Editar Leilão' : 'Cadastrar Nova Oportunidade';

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-semibold mb-6">{formTitle}</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="col-span-full">
            <label className="block text-gray-700 font-medium mb-2">Título:</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="col-span-full">
            <h3 className="text-lg font-medium text-gray-800 my-4">Localização</h3>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Cidade:</label>
            <input
              type="text"
              name="location.city"
              value={formData.location.city}
              onChange={handleInputChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Bairro (Opcional):</label>
            <input
              type="text"
              name="location.neighborhood"
              value={formData.location.neighborhood}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="col-span-full">
            <label className="block text-gray-700 font-medium mb-2">Endereço Completo:</label>
            <input
              type="text"
              name="location.fullAddress"
              value={formData.location.fullAddress}
              onChange={handleInputChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="col-span-full">
            <h3 className="text-lg font-medium text-gray-800 my-4">Informações do Leilão</h3>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Link do Anúncio:</label>
            <input
              type="text"
              name="auctionInfo.adLink"
              value={formData.auctionInfo.adLink}
              onChange={handleInputChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Data/Hora do 1º Leilão:</label>
            <input
              type="datetime-local"
              name="auctionInfo.firstAuction.date"
              value={formData.auctionInfo.firstAuction.date}
              onChange={handleInputChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Valor do 1º Leilão:</label>
            <input
              type="number"
              name="auctionInfo.firstAuction.price"
              value={formData.auctionInfo.firstAuction.price}
              onChange={handleInputChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Data/Hora do 2º Leilão (Opcional):</label>
            <input
              type="datetime-local"
              name="auctionInfo.secondAuction.date"
              value={formData.auctionInfo.secondAuction.date}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Valor do 2º Leilão (Opcional):</label>
            <input
              type="number"
              name="auctionInfo.secondAuction.price"
              value={formData.auctionInfo.secondAuction.price}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="col-span-full">
            <h3 className="text-lg font-medium text-gray-800 my-4">Análise de Viabilidade</h3>
          </div>
          
          <div className="col-span-full">
            <h4 className="text-md font-medium text-gray-600 mb-2">Informações da Arrematação</h4>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Preço de Arrematação:</label>
            <input type="number" name="biddingInfo.acquisitionPrice" value={formData.biddingInfo.acquisitionPrice} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Comissão do Leiloeiro:</label>
            <input type="number" name="biddingInfo.leiloeiroCommission" value={formData.biddingInfo.leiloeiroCommission} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">ITBI:</label>
            <input type="number" name="biddingInfo.itbiValue" value={formData.biddingInfo.itbiValue} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Taxa de Registro:</label>
            <input type="number" name="biddingInfo.registrationFee" value={formData.biddingInfo.registrationFee} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Custos com Advogado:</label>
            <input type="number" name="biddingInfo.lawyerFee" value={formData.biddingInfo.lawyerFee} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Custo da Reforma:</label>
            <input type="number" name="biddingInfo.renovationCost" value={formData.biddingInfo.renovationCost} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Custos Adicionais da Arrematação:</label>
            <input type="number" name="biddingInfo.additionalCosts" value={formData.biddingInfo.additionalCosts} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          
          <div className="col-span-full">
            <h4 className="text-md font-medium text-gray-600 mb-2 mt-6">Custos Pós-Aquisição</h4>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Período de Manutenção (meses):</label>
            <input type="number" name="postAcquisitionCosts.maintenancePeriodInMonths" value={formData.postAcquisitionCosts.maintenancePeriodInMonths} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">IPTU Mensal:</label>
            <input type="number" name="postAcquisitionCosts.monthlyIptu" value={formData.postAcquisitionCosts.monthlyIptu} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Condomínio Mensal:</label>
            <input type="number" name="postAcquisitionCosts.monthlyCondoFee" value={formData.postAcquisitionCosts.monthlyCondoFee} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Outros Custos Mensais:</label>
            <input type="number" name="postAcquisitionCosts.otherMonthlyCosts" value={formData.postAcquisitionCosts.otherMonthlyCosts} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          
          <div className="col-span-full">
            <h4 className="text-md font-medium text-gray-600 mb-2 mt-6">Informações da Venda</h4>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Preço de Venda:</label>
            <input type="number" name="saleInfo.salePrice" value={formData.saleInfo.salePrice} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Comissão do Corretor:</label>
            <input type="number" name="saleInfo.brokerCommission" value={formData.saleInfo.brokerCommission} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Imposto de Renda sobre a Venda:</label>
            <input type="number" name="saleInfo.incomeTaxOnSale" value={formData.saleInfo.incomeTaxOnSale} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          
        </div>
        
        <div className="my-8 p-4 bg-green-100 border border-green-300 rounded-lg">
          <h4 className="text-xl font-bold text-green-700">Lucro Total:</h4>
          <span className="text-2xl font-bold text-green-600">R$ {totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        
        <div className="mt-8 flex items-center gap-4">
          <button 
            type="submit" 
            disabled={loading} 
            className={`p-3 rounded-lg text-white font-semibold transition-colors ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? 'Processando...' : (editingAuction ? 'Atualizar' : 'Cadastrar Leilão')}
          </button>
          
          {editingAuction && (
            <button
              type="button"
              onClick={() => onAuctionUpdated()}
              className="p-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {success && <p className="text-green-500 mt-4">Leilão {editingAuction ? 'atualizado' : 'cadastrado'} com sucesso!</p>}
      {error && <p className="text-red-500 mt-4">Ocorreu um erro: {error}</p>}
    </div>
  );
}

export default AuctionForm;