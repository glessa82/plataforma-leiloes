// Importa as bibliotecas necessárias
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors'); 
const jwt = require('jsonwebtoken'); 
const bcrypt = require('bcryptjs'); 

// Importa o modelo que criamos para o Leilão
const Auction = require('./models/Auction');

//Importa o modelo que criamos para a autenticação de usuários
const User = require('./models/User');

// Importa o middleware de autenticação
const { protect } = require('./middleware/authMiddleware');

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// Cria uma instância do aplicativo express
const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware para processar JSON.
app.use(express.json());

// Middleware para permitir requisições de outras origens (CORS)
app.use(cors());

// String de conexão com o MongoDB, obtida do arquivo .env
const MONGODB_URI = process.env.MONGODB_URI;

// Conecta ao banco de dados MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Conectado ao MongoDB!');
    // Inicia o servidor apenas se a conexão com o banco de dados for bem-sucedida
    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Erro ao conectar ao MongoDB:', err);
  });

// --- Função para calcular o lucro ---
function calculateProfit(auctionData) {
  const { biddingInfo, postAcquisitionCosts, saleInfo } = auctionData;
  
  const totalCost = 
    (biddingInfo.acquisitionPrice || 0) + 
    (biddingInfo.leiloeiroCommission || 0) +
    (biddingInfo.itbiValue || 0) +
    (biddingInfo.registrationFee || 0) +
    (biddingInfo.lawyerFee || 0) +
    (biddingInfo.renovationCost || 0) +
    (biddingInfo.additionalCosts || 0) +
    ((postAcquisitionCosts.maintenancePeriodInMonths || 0) * (
      (postAcquisitionCosts.monthlyIptu || 0) +
      (postAcquisitionCosts.monthlyCondoFee || 0) +
      (postAcquisitionCosts.otherMonthlyCosts || 0)
    ));
    
  const totalSale = 
    (saleInfo.salePrice || 0) -
    (saleInfo.brokerCommission || 0) -
    (saleInfo.incomeTaxOnSale || 0);
  
  return totalSale - totalCost;
}

// --- Rotas da API ---

// Rota para registrar um novo usuário
app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Este email já está cadastrado.' });
        }
        const user = await User.create({ email, password });
        res.status(201).json({ 
            _id: user._id,
            email: user.email,
            message: 'Usuário registrado com sucesso!'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Rota para login de usuário
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });

        res.json({ 
            _id: user._id,
            email: user.email,
            token // Enviamos o token para o frontend
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Rota de teste
app.get('/', (req, res) => {
  res.send('API de Leilões de Imóveis funcionando e conectada ao banco de dados!');
});

// Rota para cadastrar um novo leilão
app.post('/auctions', protect, async (req, res) => {
  try {
    const auctionData = req.body;
    auctionData.profit = calculateProfit(auctionData);
    const newAuction = new Auction(auctionData);
    await newAuction.save();
    res.status(201).send(newAuction);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Rota para listar todos os leilões com filtros opcionais
app.get('/auctions', async (req, res) => {
  try {
    const { city, neighborhood, status } = req.query;
    const filter = {};
    if (city) {
      filter['location.city'] = { $regex: new RegExp(city, 'i') };
    }
    if (neighborhood) {
      filter['location.neighborhood'] = { $regex: new RegExp(neighborhood, 'i') };
    }
    if (status) {
      filter.status = status;
    }

    const auctions = await Auction.find(filter);
    res.status(200).send(auctions);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Rota para obter um leilão por ID
app.get('/auctions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const auction = await Auction.findById(id);

    if (!auction) {
      return res.status(404).send({ message: 'Leilão não encontrado.' });
    }

    res.status(200).send(auction);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Rota para atualizar um leilão
app.put('/auctions/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const auctionData = req.body;
    auctionData.profit = calculateProfit(auctionData);
    const updatedAuction = await Auction.findByIdAndUpdate(id, auctionData, { new: true, runValidators: true });

    if (!updatedAuction) {
      return res.status(404).send({ message: 'Leilão não encontrado.' });
    }

    res.status(200).send(updatedAuction);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Rota para excluir um leilão
app.delete('/auctions/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAuction = await Auction.findByIdAndDelete(id);

    if (!deletedAuction) {
      return res.status(404).send({ message: 'Leilão não encontrado.' });
    }

    res.status(200).send({ message: 'Leilão excluído com sucesso.' });
  } catch (error) {
    res.status(500).send(error);
  }
});