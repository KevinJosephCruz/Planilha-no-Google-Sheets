// backend/server.js

const express = require('express');
const { google } = require('googleapis');
const path = require('path');
const cors = require('cors'); 

const app = express();
const port = 3000; 

const KEYFILEPATH = path.join(__dirname, 'google-credentials.json');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
});

const SPREADSHEET_ID = '1nj63qia-hnLH18BG7srpf2DcFM7CNtHNV8skl6zvh88'; // Seu ID da planilha

app.use(express.json()); 
app.use(cors()); 

app.post('/api/data', async (req, res) => {
    const { Nome, Endereco, Plano, Carteirinha, Telefone } = req.body;
    
    if (!Nome || !Endereco || !Plano || !Carteirinha || !Telefone) {
        return res.status(400).json({ error: 'Todos os campos do formulário são obrigatórios.' });
    }

    try {
        const client = await auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: client });

        const headerResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Página2!1:1', // Verificado que você está usando 'Página2'
        });
        const headers = headerResponse.data.values[0]; 

        const rowData = [];
        
        headers.forEach(header => {
            switch (header) {
                case 'Nome':
                    rowData.push(Nome);
                    break;
                case 'Endereço':
                    rowData.push(Endereco);
                    break;
                case 'Plano': 
                    rowData.push(Plano);
                    break;
                case 'Carteirinha':
                    rowData.push(Carteirinha);
                    break;
                case 'Telefone':
                    rowData.push(Telefone);
                    break;
                case 'Data e Hora': // Este já estava correto para 'Data e Hora' na planilha
                    rowData.push(new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }));
                    break;
                case 'Status':
                    rowData.push('Pendente');
                    break;
                default:
                    rowData.push(''); 
            }
        });

        const request = {
            spreadsheetId: SPREADSHEET_ID, 
            range: 'Página2!A:A', // Verificado que você está usando 'Página2'
            valueInputOption: 'USER_ENTERED', 
            resource: {
                values: [rowData], 
            },
        };

        await sheets.spreadsheets.values.append(request);

        res.status(201).json({ message: 'Dados adicionados com sucesso!' });
    } catch (error) {
        console.error('Erro ao adicionar dados na planilha:', error);
        res.status(500).json({ error: 'Erro ao adicionar dados na planilha', details: error.message });
    }
});

app.get('/api/data', async (req, res) => {
    try {
        const client = await auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: client });

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Página2!A:Z', // Verificado que você está usando 'Página2'
        });

        const rows = response.data.values; 
        
        if (!rows || rows.length === 0) {
            return res.status(200).json([]); 
        }

        const headers = rows[0];
        
        const data = rows.slice(1).map(row => {
            const obj = {}; 
            
            headers.forEach((header, index) => {
                obj[header] = row[index]; 
            });
            return obj; 
        });

        res.status(200).json(data);

    } catch (error) {
        console.error('Erro ao ler dados da planilha:', error);
        res.status(500).json({ error: 'Erro ao ler dados da planilha', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
    console.log('API de Planilha pronta para uso!');
});
