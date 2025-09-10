// Importa as bibliotecas necessárias
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors'); 

// Importa o modelo que criamos para o Leilão
const Auction = require('./models/Auction');

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// Cria uma instância do aplicativo express
const app = express();
const PORT = 3000;

// Middleware para processar JSON.
// Isso permite que o nosso servidor entenda requisições com corpo no formato JSON.
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

// --- Rotas da API ---

// Rota de teste
// Método: GET
// URL: http://localhost:3000/
app.get('/', (req, res) => {
  res.send('API de Leilões de Imóveis funcionando e conectada ao banco de dados!');
});

// Rota para cadastrar um novo leilão
// Método: POST
// URL: http://localhost:3000/auctions
app.post('/auctions', async (req, res) => {
  try {
    const newAuction = new Auction(req.body);
    await newAuction.save();
    res.status(201).send(newAuction);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Rota para listar todos os leilões com filtros opcionais
// Método: GET
// URL: http://localhost:3000/auctions?city=Belo Horizonte&status=active
app.get('/auctions', async (req, res) => {
  try {
    // 1. Obtém os parâmetros de busca da requisição
    const { city, neighborhood, status } = req.query;
    
    // 2. Cria um objeto de busca dinâmico
    const filter = {};
    if (city) {
      filter['location.city'] = { $regex: new RegExp(city, 'i') }; // Busca por cidade ignorando maiúsculas/minúsculas
    }
    if (neighborhood) {
      filter['location.neighborhood'] = { $regex: new RegExp(neighborhood, 'i') }; // Busca por bairro
    }
    if (status) {
      filter.status = status; // Filtra por status exato
    }

    // 3. Executa a busca no MongoDB com base no filtro
    const auctions = await Auction.find(filter);
    res.status(200).send(auctions);
  } catch (error) {
    res.status(500).send(error);
  }
});

// ... código anterior (imports, rotas POST e GET) ...

// Rota para obter um leilão por ID
// Método: GET
// URL: http://localhost:3000/auctions/:id
app.get('/auctions/:id', async (req, res) => {
  try {
    const { id } = req.params; // Captura o ID da URL
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
// Método: PUT
// URL: http://localhost:3000/auctions/:id
app.put('/auctions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedAuction = await Auction.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!updatedAuction) {
      return res.status(404).send({ message: 'Leilão não encontrado.' });
    }

    res.status(200).send(updatedAuction);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Rota para excluir um leilão
// Método: DELETE
// URL: http://localhost:3000/auctions/:id
app.delete('/auctions/:id', async (req, res) => {
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
