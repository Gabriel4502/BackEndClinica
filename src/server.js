require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
const agendamentoRoutes = require('./routes/agendamentoRoutes');

app.use('/auth', authRoutes);
app.use('/agendamentos', agendamentoRoutes);

app.listen(4000, () => {
    console.log("Servidor rodando na porta 4000");
});