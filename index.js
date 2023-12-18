import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import { format } from 'date-fns';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const porta = 3000;
const host = 'localhost';
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: "Vi543Vale634Sil1234",
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 30
  }
}));

var listaUsuario = [];
var listaPets = [];
var listaAdocao = [];

function listaDeUsuarios(requisicao, resposta) {
  // Código existente...
}

function cadastrarPet(requisicao, resposta) {
  const dados = requisicao.body;
  if (!(dados.nome && dados.raca && dados.idade)) {
    resposta.send("Todos os campos são obrigatórios!");
    return;
  }

  const pet = {
    nome: dados.nome,
    raca: dados.raca,
    idade: parseInt(dados.idade)
  };

  listaPets.push(pet);

  // Renderiza a página de cadastro de pet com o formulário e a tabela de pets
  resposta.send(renderizarPaginaCadastroPet());
}

function renderizarPaginaCadastroPet() {
  // Gere o HTML da página de cadastro de pet com o formulário e a tabela de pets
  const paginaCadastroPet = `
  <!DOCTYPE html>
  <html lang="pt-br">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cadastro de Pet</title> 
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
      }
  
      header {
        background-color: #333;
        color: white;
        text-align: center;
        padding: 1em;
      }
  
      main {
        max-width: 800px;
        margin: 20px auto;
      }
  
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
      }
  
      th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
      }
  
      th {
        background-color: #333;
        color: white;
      }
  
      a {
        display: block;
        background-color: #333;
        color: white;
        text-align: center;
        padding: 10px;
        text-decoration: none;
        margin-top: 10px;
      }
    </style>
  </head>
  <body>
    <header>
      <h1>CADASTRO DE PET</h1>
    </header>
    
    <main>
      <div>
        <!-- Tabela de Pets -->
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Raça</th>
              <th>Idade</th>
            </tr>
          </thead>
          <tbody>
            ${listaPets.map(pet => `
              <tr>
                <td>${pet.nome}</td>
                <td>${pet.raca}</td>
                <td>${pet.idade}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
  
        <!-- Botão para voltar ao menu -->
        <a href="/">Voltar para o Menu</a>
      </div>
    </main>
  </body>
  </html>
  `;
  return paginaCadastroPet;
}


app.post('/cadastrarPet', autenticar, cadastrarPet);

function adotarPet(requisicao, resposta) {
    const dados = requisicao.body;
    if (!(dados.interessado && dados.pet)) {
      resposta.send("Escolha um interessado e um pet para adoção!");
      return;
    }
  
    const adocao = {
      interessado: dados.interessado,
      pet: dados.pet,
      dataAdocao: new Date().toLocaleString()
    };
  
    listaAdocao.push(adocao);
  
    resposta.redirect('/');
}

// Função para renderizar o menu
function renderizarMenu(usuario) {
  const ultimoAcesso = usuario.ultimoAcesso || "Nunca";
  const menu = `
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Menu do Sistema</title> 
      <link rel="stylesheet" href="style2.css"> 
    </head>
    <body>
      <header>
        <h1>MENU</h1>
      </header>
      
      <main>
        <div>
          <ul>
            <li><a href="/cadastrarUsuario.html">Cadastrar Usuário</a></li>
            <li><a href="/cadastrarPet.html">Cadastrar Pet</a></li>
            <li><a href="/adotarPet">Adotar Pet</a></li>
          </ul>

          <p>O último acesso foi ${ultimoAcesso}.</p>
        </div>
      </main>
    </body>
    </html>`;
  return menu;
}

// Middleware para autenticar o usuário
function autenticar(requisicao, resposta, next) {
  if (requisicao.session.usuarioAutenticado) {
    const usuario = requisicao.session.usuario;
    usuario.ultimoAcesso = new Date().toLocaleString();
    next();
  } else {
    resposta.redirect("/login.html");
  }
}

// Rotas

app.post('/login', (requisicao, resposta) => {
  const usuario = requisicao.body.usuario;
  const senha = requisicao.body.senha;

  if (usuario && senha && (usuario == "vitor") && (senha == "123")) {
    const usuarioSessao = { usuarioAutenticado: true };
    requisicao.session.usuarioAutenticado = true;
    requisicao.session.usuario = usuarioSessao;
    resposta.redirect('/'); // Redireciona para a página principal (menu)
  } else {
    resposta.send("Credenciais inválidas");
  }
});

app.get('/login.html', (requisicao, resposta) => {
    const filePath = join(__dirname, 'paginas', 'login.html');
    resposta.sendFile(filePath);
});

app.post('/listaUsuarios', autenticar, listaDeUsuarios);

app.post('/cadastrarPet', autenticar, cadastrarPet);

app.get('/adotarPet', autenticar, (requisicao, resposta) => {
  // Código para a página de adoção...
});

app.get('/', autenticar, (requisicao, resposta) => {
  const usuario = requisicao.session.usuario;
  resposta.send(renderizarMenu(usuario));
});

app.use(express.static('./paginas'));

app.listen(porta, host, () => {
    console.log(`Servidor executado na url http://${host}:${porta}`);
});

app.get('/adotarPet', autenticar, (requisicao, resposta) => {
  console.log("Acessando rota /adotarPet");
  // Renderize a página adotarPet.html aqui
  const filePath = join(__dirname, 'paginas', 'adotarPet.html');
  resposta.sendFile(filePath);
});
