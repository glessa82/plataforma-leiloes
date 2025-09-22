const mongoose = require('mongoose');

// Define a estrutura (schema) do documento de Leilao
const auctionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  
  // Informações de Localização
  location: {
    city: {
      type: String,
      required: true,
      trim: true,
    },
    neighborhood: {
      type: String,
      trim: true,
    },
    fullAddress: {
      type: String,
      required: true,
      trim: true,
    },
  },

  // Dados do Leilão
  auctionInfo: {
    adLink: {
      type: String,
      required: true,
      trim: true,
    },
    firstAuction: {
      date: {
        type: Date,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
    },
    secondAuction: {
      date: {
        type: Date,
      },
      price: {
        type: Number,
      },
    },
  },

  // Dados da Arrematação
  biddingInfo: {
    acquisitionPrice: {
      type: Number,
      default: 0,
    },
    leiloeiroCommission: {
      type: Number,
      default: 0,
    },
    itbiValue: {
      type: Number,
      default: 0,
    },
    registrationFee: {
      type: Number,
      default: 0,
    },
    lawyerFee: {
      type: Number,
      default: 0,
    },
    renovationCost: {
      type: Number,
      default: 0,
    },
    additionalCosts: {
      type: Number,
      default: 0,
    },
  },

  // Custos Pós-Aquisição (Manutenção do imóvel)
  postAcquisitionCosts: {
    maintenancePeriodInMonths: {
      type: Number,
      default: 0,
    },
    monthlyIptu: {
      type: Number,
      default: 0,
    },
    monthlyCondoFee: {
      type: Number,
      default: 0,
    },
    otherMonthlyCosts: {
      type: Number,
      default: 0,
    },
  },

  // Informações da Venda
  saleInfo: {
    salePrice: {
      type: Number,
      default: 0,
    },
    brokerCommission: {
      type: Number,
      default: 0,
    },
    incomeTaxOnSale: {
      type: Number,
      default: 0,
    },
  },

  status: {
    type: String,
    enum: ['pending', 'active', 'won', 'sold'],
    default: 'pending',
  },

   profit: Number,
  
  // O Mongoose adiciona automaticamente a data de criação
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Auction = mongoose.model('Auction', auctionSchema);

module.exports = Auction;