// --- Variáveis Globais ---
let gameMap; // Objeto que gerencia o mapa e os nós/arestas
let fleet = []; // Array de objetos Caminhão
let orders = []; // Array de objetos Pedido
let ui; // Objeto para a interface do usuário

let money = 5000; // Dinheiro inicial
let currentDay = 1;
let totalDays = 60; // Duração do jogo

// Tipos de produtos
const PRODUCTS = ['Soja', 'Milho', 'Algodão', 'Bovino'];
// Tipos de nós no mapa
const NODE_TYPES = {
  FARM: 'farm',
  DISTRIBUTION: 'distribution',
  MARKET: 'market',
  JUNCTION: 'junction' // Apenas para conexão de estradas
};

function setup() {
  createCanvas(800, 700); // Espaço para o mapa e a UI
  textSize(16);
  textAlign(LEFT, TOP);

  gameMap = new GameMap();
  ui = new UI();

  // Cria alguns nós de exemplo no mapa (você criaria mais programaticamente ou de um arquivo)
  gameMap.addNode('Fazenda A', NODE_TYPES.FARM, 100, 100);
  gameMap.addNode('Mercado Principal', NODE_TYPES.MARKET, 700, 600);
  gameMap.addNode('Centro Dist. Sul', NODE_TYPES.DISTRIBUTION, 300, 500);
  gameMap.addNode('Fazenda B', NODE_TYPES.FARM, 650, 150);
  gameMap.addNode('Entroncamento 1', NODE_TYPES.JUNCTION, 400, 300);

  // Cria algumas conexões (arestas)
  gameMap.addConnection('Fazenda A', 'Entroncamento 1', 150, 'asphalt');
  gameMap.addConnection('Entroncamento 1', 'Mercado Principal', 350, 'dirt');
  gameMap.addConnection('Entroncamento 1', 'Centro Dist. Sul', 250, 'asphalt');
  gameMap.addConnection('Fazenda B', 'Entroncamento 1', 200, 'asphalt');
  gameMap.addConnection('Centro Dist. Sul', 'Mercado Principal', 200, 'dirt');


  // Adiciona alguns caminhões iniciais
  fleet.push(new Truck('Caminhão 1', 100, 50, gameMap.nodes['Fazenda A']));
  fleet.push(new Truck('Caminhão 2', 80, 40, gameMap.nodes['Fazenda B']));

  // Gera o primeiro pedido
  generateNewOrder();
}

function draw() {
  background(220); // Fundo cinza claro

  gameMap.display();

  // Atualiza e exibe caminhões
  for (let truck of fleet) {
    truck.update();
    truck.display();
  }

  ui.display();

  // Lógica de "game over" ou "vitória"
  if (currentDay > totalDays) {
    fill(0, 0, 0, 200);
    rect(0, 0, width, height);
    fill(255);
    textSize(60);
    textAlign(CENTER, CENTER);
    text("FIM DE JOGO!", width / 2, height / 2 - 50);
    textSize(30);
    text(`Lucro Final: $${money}`, width / 2, height / 2 + 20);
    noLoop();
  }
}

function mousePressed() {
  ui.handleMouseClick(mouseX, mouseY);
  gameMap.handleMouseClick(mouseX, mouseY); // Para selecionar nós ou caminhões
}

// --- Classes do Jogo ---

// Classe Nó (Fazenda, Mercado, Centro de Distribuição, Junção)
class Node {
  constructor(name, type, x, y) {
    this.name = name;
    this.type = type; // 'farm', 'distribution', 'market', 'junction'
    this.x = x;
    this.y = y;
    this.connections = {}; // { targetNodeName: { distance, roadType } }
  }

  display() {
    let nodeColor;
    if (this.type === NODE_TYPES.FARM) nodeColor = color(0, 150, 0); // Verde para fazendas
    else if (this.type === NODE_TYPES.MARKET) nodeColor = color(200, 0, 0); // Vermelho para mercados
    else if (this.type === NODE_TYPES.DISTRIBUTION) nodeColor = color(0, 0, 200); // Azul para centros de distribuição
    else nodeColor = color(150); // Cinza para junções

    fill(nodeColor);
    stroke(0);
    ellipse(this.x, this.y, 20, 20);
    fill(0);
    textSize(12);
    textAlign(CENTER, BOTTOM);
    text(this.name, this.x, this.y - 15);
  }
}

// Classe Mapa (gerencia nós e conexões)
class GameMap {
  constructor() {
    this.nodes = {}; // { name: Node object }
    this.selectedNode = null; // Para interação do usuário
  }

  addNode(name, type, x, y) {
    this.nodes[name] = new Node(name, type, x, y);
  }

  addConnection(node1Name, node2Name, distance, roadType) {
    if (this.nodes[node1Name] && this.nodes[node2Name]) {
      this.nodes[node1Name].connections[node2Name] = { distance, roadType };
      this.nodes[node2Name].connections[node1Name] = { distance, roadType }; // Conexão bidirecional
    }
  }

  display() {
    // Desenha as conexões (estradas) primeiro
    stroke(100);
    strokeWeight(3);
    for (let nodeName in this.nodes) {
      let node = this.nodes[nodeName];
      for (let targetName in node.connections) {
        let targetNode = this.nodes[targetName];
        // Para evitar desenhar a mesma linha duas vezes
        if (node.x < targetNode.x || (node.x === targetNode.x && node.y < targetNode.y)) {
          line(node.x, node.y, targetNode.x, targetNode.y);
        }
      }
    }

    // Desenha os nós por cima das estradas
    for (let nodeName in this.nodes) {
      this.nodes[nodeName].display();
    }
  }

  handleMouseClick(mx, my) {
    for (let nodeName in this.nodes) {
      let node = this.nodes[nodeName];
      let d = dist(mx, my, node.x, node.y);
      if (d < 10) { // Clicou em um nó
        this.selectedNode = node;
        console.log(`Nó selecionado: ${node.name}`);
        // Aqui você pode abrir um menu de contexto para o nó
        return;
      }
    }
    this.selectedNode = null; // Clicou fora dos nós
  }

  // Encontra o caminho mais curto entre dois nós (exemplo simplificado - implemente Dijkstra/A*)
  findPath(startNodeName, endNodeName) {
    // Implemente um algoritmo de pathfinding como Dijkstra ou A* aqui.
    // Retorne um array de nomes de nós que formam o caminho.
    // Por enquanto, apenas um caminho direto de exemplo.
    if (this.nodes[startNodeName].connections[endNodeName]) {
      return [startNodeName, endNodeName];
    }
    // Lógica para caminhos com múltiplos nós
    console.warn("Pathfinding não totalmente implementado. Retornando caminho direto ou vazio.");
    return [];
  }
}

// Classe Caminhão
class Truck {
  constructor(name, capacity, fuelConsumption, currentNode) {
    this.name = name;
    this.capacity = capacity; // Capacidade de carga
    this.fuel = 100; // Combustível inicial
    this.fuelConsumption = fuelConsumption; // Consumo por unidade de distância
    this.currentNode = currentNode; // Nó atual (objeto Node)
    this.targetNode = null; // Nó para onde está indo
    this.path = []; // Array de nós no caminho
    this.currentPathIndex = 0;
    this.x = currentNode.x;
    this.y = currentNode.y;
    this.speed = 2; // Velocidade em pixels por frame
    this.carryingOrder = null; // Objeto Order que está sendo transportado
  }

  display() {
    fill(50, 100, 250); // Caminhão azul
    stroke(0);
    rect(this.x - 10, this.y - 10, 20, 20); // Desenha o caminhão
    fill(0);
    textSize(10);
    textAlign(CENTER, BOTTOM);
    text(this.name, this.x, this.y - 15);
  }

  update() {
    if (this.path.length > 0 && this.currentPathIndex < this.path.length - 1) {
      this.targetNode = gameMap.nodes[this.path[this.currentPathIndex + 1]];
      let dx = this.targetNode.x - this.x;
      let dy = this.targetNode.y - this.y;
      let angle = atan2(dy, dx);

      this.x += cos(angle) * this.speed;
      this.y += sin(angle) * this.speed;

      // Verificação de chegada ao próximo nó
      if (dist(this.x, this.y, this.targetNode.x, this.targetNode.y) < this.speed) {
        this.x = this.targetNode.x;
        this.y = this.targetNode.y;
        this.currentNode = this.targetNode;
        this.currentPathIndex++;

        if (this.currentPathIndex === this.path.length - 1) {
          // Chegou ao destino final do caminho
          console.log(`${this.name} chegou em ${this.currentNode.name}`);
          if (this.carryingOrder) {
            // Se chegou no destino da entrega
            if (this.currentNode.name === this.carryingOrder.destination) {
              this.completeOrder();
            } else {
              // Se chegou em um nó intermediário, continua no próximo update
            }
          }
          this.path = []; // Limpa o caminho após chegar
          this.currentPathIndex = 0;
        }
      }
    }
  }

  // Atribui uma ordem ao caminhão
  assignOrder(order, pathNodes) {
    if (this.carryingOrder === null && order.quantity <= this.capacity) {
      this.carryingOrder = order;
      this.path = pathNodes;
      this.currentPathIndex = 0;
      console.log(`${this.name} pegou a ordem para ${order.product} de ${order.origin} para ${order.destination}`);
    } else {
      console.log("Não é possível atribuir a ordem ao caminhão.");
    }
  }

  // Completa a ordem
  completeOrder() {
    money += this.carryingOrder.payout;
    console.log(`Ordem de ${this.carryingOrder.product} entregue! Ganhou $${this.carryingOrder.payout}. Total: $${money}`);
    orders = orders.filter(o => o !== this.carryingOrder); // Remove a ordem completa
    this.carryingOrder = null;
    generateNewOrder(); // Gera uma nova ordem após completar uma
  }
}

// Classe Pedido/Ordem de Transporte
class Order {
  constructor(id, product, quantity, originNode, destinationNode, payout) {
    this.id = id;
    this.product = product;
    this.quantity = quantity;
    this.origin = originNode.name;
    this.destination = destinationNode.name;
    this.payout = payout;
    // this.deadline = deadline; // Adicionar lógica de prazo
  }
}

// Classe Interface de Usuário
class UI {
  constructor() {
    this.buttonNextDay = new Button("Próximo Dia", width - 120, 20, 100, 40, () => this.nextDay());
    this.buttonBuyTruck = new Button("Comprar Caminhão ($2000)", width - 180, height - 70, 160, 40, () => this.buyTruck());
  }

  display() {
    fill(0);
    text(`Dia: ${currentDay}/${totalDays}`, 20, 20);
    text(`Dinheiro: $${money}`, 20, 50);

    // Exibe ordens ativas
    text("Pedidos:", 20, 100);
    let yOffset = 0;
    for (let order of orders) {
      text(`- ${order.product} (${order.quantity}t) de ${order.origin} para ${order.destination} ($${order.payout})`, 20, 120 + yOffset);
      yOffset += 20;
    }

    // Exibe informações dos caminhões
    text("Frota:", width - 200, 100);
    yOffset = 0;
    for (let truck of fleet) {
      text(`- ${truck.name}: ${truck.currentNode.name} (Comb: ${floor(truck.fuel)}%)`, width - 200, 120 + yOffset);
      yOffset += 20;
    }

    this.buttonNextDay.display();
    this.buttonBuyTruck.display();

    // UI para o nó selecionado (ex: atribuir caminhão)
    if (gameMap.selectedNode) {
      fill(255, 255, 200, 200); // Fundo amarelado
      rect(mouseX + 10, mouseY + 10, 200, 100);
      fill(0);
      text(`Nó: ${gameMap.selectedNode.name} (${gameMap.selectedNode.type})`, mouseX + 20, mouseY + 30);
      // Aqui você poderia adicionar botões de ação para o nó
    }
  }

  handleMouseClick(mx, my) {
    this.buttonNextDay.checkClick(mx, my);
    this.buttonBuyTruck.checkClick(mx, my);
  }

  nextDay() {
    currentDay++;
    // Lógica diária: gerar novos pedidos, consumir combustível, etc.
    console.log(`Avançando para o Dia ${currentDay}`);
    for (let truck of fleet) {
      // Combustível será consumido no update do caminhão conforme ele anda
      // Adicione consumo de combustível passivo ou manutenções aqui
    }
    generateNewOrder(); // Gera um novo pedido a cada dia (pode ser ajustado)
  }

  buyTruck() {
    if (money >= 2000) {
      money -= 2000;
      let newTruckName = `Caminhão ${fleet.length + 1}`;
      // Posiciona o novo caminhão em um nó de fazenda aleatório
      let farmNodes = Object.values(gameMap.nodes).filter(node => node.type === NODE_TYPES.FARM);
      let randomFarm = random(farmNodes);
      fleet.push(new Truck(newTruckName, 90, 45, randomFarm));
      console.log(`${newTruckName} comprado! Dinheiro: $${money}`);
    } else {
      console.log("Dinheiro insuficiente para comprar um caminhão.");
    }
  }
}

// Classe Botão (genérica) - reutilizada do jogo anterior
class Button {
  constructor(label, x, y, w, h, onClick) {
    this.label = label;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.onClick = onClick;
  }

  display() {
    fill(50, 100, 150); // Cor do botão
    rect(this.x, this.y, this.w, this.h, 5); // Cantos arredondados

    fill(255); // Cor do texto
    textSize(16);
    textAlign(CENTER, CENTER);
    text(this.label, this.x + this.w / 2, this.y + this.h / 2);
  }

  checkClick(mx, my) {
    if (mx > this.x && mx < this.x + this.w && my > this.y && my < this.y + this.h) {
      this.onClick(); // Chama a função associada ao botão
    }
  }
}

// --- Funções Auxiliares do Jogo ---

function generateNewOrder() {
  // Encontra fazendas e mercados/centros de distribuição
  let farmNodes = Object.values(gameMap.nodes).filter(node => node.type === NODE_TYPES.FARM);
  let destinationNodes = Object.values(gameMap.nodes).filter(node => node.type === NODE_TYPES.MARKET || node.type === NODE_TYPES.DISTRIBUTION);

  if (farmNodes.length > 0 && destinationNodes.length > 0) {
    let origin = random(farmNodes);
    let destination = random(destinationNodes);
    let product = random(PRODUCTS);
    let quantity = floor(random(10, 50)); // Carga entre 10 e 50 toneladas
    let payout = quantity * floor(random(50, 100)); // Pagamento baseado na quantidade

    let newOrder = new Order(orders.length + 1, product, quantity, origin, destination, payout);
    orders.push(newOrder);
    console.log(`Novo pedido: ${product} (${quantity}t) de ${origin.name} para ${destination.name}`);
  } else {
    console.warn("Não há fazendas ou destinos suficientes para gerar pedidos.");
  }
}

// Função para atribuir uma ordem a um caminhão (simplesmente pega a primeira ordem e o primeiro caminhão disponível)
// Em um jogo real, o jogador faria essa escolha.
function assignRandomOrderToTruck() {
  if (orders.length > 0 && fleet.length > 0) {
    let availableTrucks = fleet.filter(t => t.carryingOrder === null);
    if (availableTrucks.length > 0) {
      let truck = availableTrucks[0]; // Pega o primeiro caminhão disponível
      let order = orders[0]; // Pega a primeira ordem

      // Encontre o caminho da origem da ordem até o destino da ordem
      let pathToOrigin = gameMap.findPath(truck.currentNode.name, order.origin);
      let pathToDestination = gameMap.findPath(order.origin, order.destination);

      if (pathToOrigin.length > 0 && pathToDestination.length > 0) {
        // Concatena os caminhos: ir para origem e depois para destino
        let fullPath = pathToOrigin.concat(pathToDestination.slice(1)); // Remove o nó de origem duplicado
        truck.assignOrder(order, fullPath);
      } else {
        console.log("Caminho não encontrado para esta ordem.");
      }
    } else {
      console.log("Nenhum caminhão disponível para atribuir a ordem.");
    }
  }
}

// Para testar a atribuição de ordens automaticamente
function keyPressed() {
  if (key === 'a') { // Pressione 'a' para tentar atribuir uma ordem
    assignRandomOrderToTruck();
  }
}