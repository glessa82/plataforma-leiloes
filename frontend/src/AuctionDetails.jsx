import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AuctionDetails = ({ auction, onBackToList, onEdit, onDelete }) => {
  if (!auction) {
    return <p className="text-center text-gray-500">Nenhum leilão selecionado para visualização.</p>;
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date)) return 'Data Inválida';
    return date.toLocaleString('pt-BR');
  };

  const renderSection = (title, fields) => (
    <div className="bg-gray-50 p-4 rounded-lg shadow-inner mb-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {fields.map((field, index) => (
          <div key={index} className="p-3 bg-white border border-gray-200 rounded-md">
            <p className="text-sm font-medium text-gray-500">{field.label}:</p>
            <p className="text-md font-bold text-gray-800">{field.value}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const profitValue = auction.profit || 0;
  const profitColorClass = profitValue >= 0 ? 'text-green-600' : 'text-red-600';

  const biddingCosts = auction.biddingInfo || {};
  const postAcquisitionCosts = auction.postAcquisitionCosts || {};
  const saleInfo = auction.saleInfo || {};

  const totalRevenue = parseFloat(saleInfo.salePrice) || 0;
  
  // Vamos simplificar e agregar os custos para o DRE
  const totalBiddingCosts = 
    (biddingCosts.acquisitionPrice || 0) + 
    (biddingCosts.leiloeiroCommission || 0) +
    (biddingCosts.itbiValue || 0) +
    (biddingCosts.registrationFee || 0) +
    (biddingCosts.lawyerFee || 0) +
    (biddingCosts.renovationCost || 0) +
    (biddingCosts.additionalCosts || 0);

  const totalPostAcquisitionCosts =
    (parseFloat(postAcquisitionCosts.maintenancePeriodInMonths) || 0) * (
      (parseFloat(postAcquisitionCosts.monthlyIptu) || 0) +
      (parseFloat(postAcquisitionCosts.monthlyCondoFee) || 0) +
      (parseFloat(postAcquisitionCosts.otherMonthlyCosts) || 0)
    );

  const totalSaleCosts = (saleInfo.brokerCommission || 0) + (saleInfo.incomeTaxOnSale || 0);
  
  // Dados para o Gráfico DRE/Cascata
  const chartData = {
    labels: ['Receita Total', 'Custos de Aquisição', 'Custos Pós-Aquisição', 'Custos de Venda', 'Lucro Final'],
    datasets: [
      {
        label: 'Análise Financeira',
        data: [totalRevenue, -totalBiddingCosts, -totalPostAcquisitionCosts, -totalSaleCosts, profitValue],
        backgroundColor: (context) => {
          const value = context.dataset.data[context.dataIndex];
          if (value > 0) return 'rgba(76, 175, 80, 0.8)'; // Verde para receitas e lucros
          if (value < 0) return 'rgba(244, 67, 54, 0.8)'; // Vermelho para custos
          return 'rgba(158, 158, 158, 0.8)'; // Cinza para zero
        },
        borderColor: (context) => {
          const value = context.dataset.data[context.dataIndex];
          if (value > 0) return 'rgba(76, 175, 80, 1)';
          if (value < 0) return 'rgba(244, 67, 54, 1)';
          return 'rgba(158, 158, 158, 1)';
        },
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Demonstração de Resultado por Leilão',
        font: { size: 18, weight: 'bold' }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += formatCurrency(Math.abs(context.raw));
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        grid: { display: true },
        ticks: {
          callback: (value) => formatCurrency(value)
        }
      }
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-8 my-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-blue-600">{auction.title}</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => onEdit(auction._id)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Editar
          </button>
          <button 
            onClick={() => onDelete(auction._id)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Excluir
          </button>
          <button 
            onClick={onBackToList} 
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            &larr; Voltar
          </button>
        </div>
      </div>
      
      <div className="mb-6">
        <p className="text-gray-600">Status: <span className="font-semibold">{auction.status}</span></p>
        <p className="text-gray-600">Lucro Total Estimado: <span className={`font-bold ${profitColorClass}`}>{formatCurrency(profitValue)}</span></p>
      </div>
      
      <div className="my-8 p-4 bg-white rounded-lg shadow-inner">
        <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">Análise Financeira Completa</h3>
        <Bar data={chartData} options={chartOptions} />
      </div>

      {renderSection("Informações do Leilão", [
        { label: "Link do Anúncio", value: auction.auctionInfo?.adLink || 'N/A' },
        { label: "1º Data do Leilão", value: formatDate(auction.auctionInfo?.firstAuction?.date) },
        { label: "1º Valor", value: formatCurrency(auction.auctionInfo?.firstAuction?.price || 0) },
        { label: "2º Data do Leilão", value: formatDate(auction.auctionInfo?.secondAuction?.date) },
        { label: "2º Valor", value: formatCurrency(auction.auctionInfo?.secondAuction?.price || 0) },
      ])}
      
      {renderSection("Análise de Viabilidade", [
        { label: "Preço de Aquisição", value: formatCurrency(auction.biddingInfo?.acquisitionPrice || 0) },
        { label: "Comissão Leiloeiro", value: formatCurrency(auction.biddingInfo?.leiloeiroCommission || 0) },
        { label: "Valor do ITBI", value: formatCurrency(auction.biddingInfo?.itbiValue || 0) },
        { label: "Taxa de Registro", value: formatCurrency(auction.biddingInfo?.registrationFee || 0) },
        { label: "Custos com Advogado", value: formatCurrency(auction.biddingInfo?.lawyerFee || 0) },
        { label: "Custo da Reforma", value: formatCurrency(auction.biddingInfo?.renovationCost || 0) },
        { label: "Custos Adicionais", value: formatCurrency(auction.biddingInfo?.additionalCosts || 0) },
      ])}

      {renderSection("Custos Pós-Aquisição", [
        { label: "Período de Manutenção (meses)", value: auction.postAcquisitionCosts?.maintenancePeriodInMonths || '0' },
        { label: "IPTU Mensal", value: formatCurrency(auction.postAcquisitionCosts?.monthlyIptu || 0) },
        { label: "Condomínio Mensal", value: formatCurrency(auction.postAcquisitionCosts?.monthlyCondoFee || 0) },
        { label: "Outros Custos Mensais", value: formatCurrency(auction.postAcquisitionCosts?.otherMonthlyCosts || 0) },
      ])}
      
      {renderSection("Informações da Venda", [
        { label: "Preço de Venda", value: formatCurrency(auction.saleInfo?.salePrice || 0) },
        { label: "Comissão do Corretor", value: formatCurrency(auction.saleInfo?.brokerCommission || 0) },
        { label: "Imposto sobre a Venda", value: formatCurrency(auction.saleInfo?.incomeTaxOnSale || 0) },
      ])}
    </div>
  );
};

export default AuctionDetails;