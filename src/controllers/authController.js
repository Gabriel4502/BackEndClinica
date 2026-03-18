const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = {
    async registrar(req, res) {
        const { nome, email, senha, tipo } = req.body;

        try {
            
            const usuarioExistente = await prisma.usuario.findUnique({ where: { email } });
            if (usuarioExistente) {
                return res.status(400).json({ error: 'Usuário já cadastrado com este email.' });
            }

           
            const salt = await bcrypt.genSalt(10);
            const senhaCriptografada = await bcrypt.hash(senha, salt);

          
            const novoUsuario = await prisma.usuario.create({
                data: {
                    nome,
                    email,
                    senha: senhaCriptografada,
                    tipo: tipo || 'paciente'
                }
            });

            novoUsuario.senha = undefined;
            return res.status(201).json(novoUsuario);

        } catch (erro) {
            console.error(erro);
            return res.status(500).json({ error: 'Erro interno ao registrar usuário.' });
        }
    },

    async login(req, res) {
        const { email, senha } = req.body;

        try {
            const usuario = await prisma.usuario.findUnique({ where: { email } });
            if (!usuario) {
                return res.status(400).json({ error: 'Usuário não encontrado.' });
            }

            const senhaValida = await bcrypt.compare(senha, usuario.senha);
            if (!senhaValida) {
                return res.status(400).json({ error: 'Senha inválida.' });
            }

   
            const token = jwt.sign(
                { id: usuario.id, tipo: usuario.tipo },
                process.env.JWT_SECRET || 'chave_super_secreta',
                { expiresIn: '1d' }
            );

            usuario.senha = undefined;
            return res.json({ usuario, token });

        } catch (erro) {
            console.error(erro);
            return res.status(500).json({ error: 'Erro interno ao fazer login.' });
        }
    },



    async listar(req, res) {
        try {
     
            const usuarios = await prisma.usuario.findMany({
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    tipo: true
                }
            });
            return res.json(usuarios);
        } catch (erro) {
            console.error(erro);
            return res.status(500).json({ error: 'Erro interno ao listar usuários.' });
        }
    }
};

