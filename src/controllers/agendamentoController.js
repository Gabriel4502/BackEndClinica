const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');

module.exports = {
    async criar(req, res) {
        const { dataHora, cep, enderecoCompleto } = req.body;
        const pacienteId = req.usuarioId; 

        try {
            const dataConsulta = new Date(dataHora);
            
            const horarioOcupado = await prisma.agendamento.findFirst({
                where: { dataHora: dataConsulta }
            });

            if (horarioOcupado) {
                return res.status(400).json({ error: 'Este horário já está reservado. Por favor, escolha outro.' });
            }
        } catch (erro) {
            console.error("Erro na verificação de horário:", erro);
            return res.status(500).json({ error: 'Erro interno ao verificar disponibilidade.' });
        }

        let previsaoTempo = "Previsão indisponível no momento";
      
        try {
            const cidadeBusca = req.body.cidade || "Rio de Janeiro"; 
            
            const apiKey = process.env.WEATHER_API_KEY; 
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cidadeBusca)},br&appid=${apiKey}&units=metric&lang=pt_br`;
            
            const respostaClima = await axios.get(url);
            
            const condicao = respostaClima.data.weather[0].description;
            const temp = respostaClima.data.main.temp;
            
            previsaoTempo = `${condicao} (${temp}°C)`;

        } catch (erroClima) {
            console.log("Erro na API de Clima:", erroClima.response ? erroClima.response.data : erroClima.message);
            previsaoTempo = "Previsão indisponível no momento";
        }

        try {
            const novoAgendamento = await prisma.agendamento.create({
                data: {
                    dataHora: new Date(dataHora),
                    cep,
                    enderecoCompleto,
                    previsaoTempo,
                    pacienteId
                }
            });

            return res.status(201).json(novoAgendamento);
        } catch (erro) {
            console.error(erro);
            return res.status(500).json({ error: 'Erro ao criar agendamento.' });
        }
    },

    async listar(req, res) {
        try {
            const agendamentos = await prisma.agendamento.findMany({
                include: {
                    paciente: {
                        select: { nome: true, email: true }
                    }
                }
            });
            return res.json(agendamentos);
        } catch (erro) {
            console.error(erro);
            return res.status(500).json({ error: 'Erro ao listar agendamentos.' });
        }
    }
};