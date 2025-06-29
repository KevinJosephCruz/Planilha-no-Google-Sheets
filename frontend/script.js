const API_BASE_URL = 'http://localhost:3000/api';

// Adiciona um listener para quando o DOM (estrutura HTML) estiver completamente carregado
document.addEventListener('DOMContentLoaded', () => {
    // 1. Referências aos Elementos HTML (IDs CORRIGIDOS)
    // Obtém referências aos elementos do formulário e da lista usando seus IDs corretos do HTML.
    const cadastroForm = document.getElementById('cadastroForm'); // CORRIGIDO: de 'userForm' para 'cadastroForm'
    const dataList = document.getElementById('dataList');       // CORRIGIDO: de 'userList' para 'dataList'

    // 2. Função Assíncrona para Carregar e Exibir Dados da Planilha
    // Esta função será responsável por buscar os dados do back-end e mostrá-los na página.
    async function loadData() { // Renomeado para 'loadData' para consistência
        dataList.innerHTML = 'Carregando dados...'; // Exibe uma mensagem de carregamento
        try {
            // 2.1. Faz uma Requisição GET ao Back-end
            // Requisição GET para a rota '/api/data' (consistente com o server.js).
            const response = await fetch(`${API_BASE_URL}/data`);
            
            // 2.2. Verifica o Status da Resposta HTTP
            if (!response.ok) {
                throw new Error(`Erro HTTP! status: ${response.status}`);
            }
            
            // 2.3. Converte a Resposta para JSON
            const data = await response.json();

            dataList.innerHTML = ''; // Limpa a mensagem de carregamento ou dados anteriores
            
            // 2.4. Exibe os Dados na Lista
            if (data.length > 0) {
                data.forEach(item => {
                    const listItem = document.createElement('li'); // Cria um novo item de lista (<li>)
                    // Define o conteúdo de texto do item da lista, usando os nomes de cabeçalho da planilha.
                    // Usamos '|| 'N/A'' para exibir 'N/A' caso algum campo esteja vazio/indefinido.
                    listItem.textContent = `
                        Nome: ${item.Nome || 'N/A'}, 
                        Endereço: ${item.Endereço || 'N/A'}, 
                        Plano: ${item.Plano || 'N/A'}, 
                        Carteirinha: ${item.Carteirinha || 'N/A'}, 
                        Telefone: ${item.Telefone || 'N/A'}, 
                        Data/Hora: ${item['Data/Hora'] || 'N/A'}, 
                        Status: ${item.Status || 'N/A'}
                    `;
                    dataList.appendChild(listItem); // Adiciona o item à lista na página HTML.
                });
            } else {
                dataList.textContent = 'Nenhum dado cadastrado ainda.'; // Mensagem se a planilha estiver vazia
            }
        } catch (error) {
            // 2.5. Tratamento de Erro na Leitura
            console.error('Erro ao carregar dados:', error);
            dataList.innerHTML = `Erro ao carregar dados: ${error.message}. Verifique se o backend está rodando e conectado à planilha.`;
        }
    }

    // 3. Listener para o Envio do Formulário
    // Adiciona um listener para o evento 'submit' do formulário (agora 'cadastroForm' é válido).
    cadastroForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Impede o comportamento padrão do formulário (recarregar a página)

        // 3.1. Coleta os Valores do Formulário
        // Cria um objeto com os dados dos campos do formulário, usando os 'id's corretos.
        const formData = {
            Nome: document.getElementById('nome').value,
            Endereco: document.getElementById('endereco').value,
            Plano: document.getElementById('plano').value,
            Carteirinha: document.getElementById('carteirinha').value,
            Telefone: document.getElementById('telefone').value
        };

        try {
            // 3.2. Faz uma Requisição POST ao Back-end
            // Envia os dados do formulário para '/api/data' (consistente com o server.js).
            const response = await fetch(`${API_BASE_URL}/data`, {
                method: 'POST', // Define o método HTTP como POST
                headers: {
                    'Content-Type': 'application/json' // Informa ao servidor que o corpo é JSON
                },
                body: JSON.stringify(formData) // Converte o objeto 'formData' para uma string JSON
            });

            const result = await response.json(); // Converte a resposta do servidor (JSON) para objeto JS
            
            // 3.3. Verifica o Status da Resposta do Servidor
            if (response.ok) { // Se a resposta HTTP for 2xx (sucesso)
                alert('Dados enviados com sucesso!'); // Exibe um alerta de sucesso
                cadastroForm.reset(); // Limpa todos os campos do formulário
                loadData(); // Recarrega a lista de dados para mostrar o novo item adicionado
            } else {
                // Se houver um erro (status HTTP diferente de 2xx), exibe o erro do servidor.
                alert('Erro ao enviar dados: ' + (result.message || result.error));
                console.error('Erro de resposta do servidor:', result); // Loga o erro completo no console
            }
        } catch (error) {
            // 3.4. Tratamento de Erro na Comunicação
            console.error('Erro na comunicação com o servidor:', error);
            alert('Erro na comunicação com o servidor. Verifique se o backend está rodando.');
        }
    });

    // 4. Chamada Inicial da Função loadData
    // Chama a função 'loadData()' assim que o DOM é carregado para que a lista de dados
    // seja preenchida com os dados existentes na planilha quando a página abre.
    loadData();
});