require('dotenv').config();
const { HyWaBot, HytechMessages, HytechHandle } = require('wabot-openai');
const data = {
    phoneNumber: process.env.PHONE,
    sessionId: 'session',
    useStore: true,
};
const bot = new HyWaBot(data);
bot.start()
    .then(sock => {
        sock.ev.on('messages.upsert', async chatUpdate => {
            try {
                let m = chatUpdate.messages[0];
                if (!m.message) return;
                const result = await HytechMessages(m);
                console.log('Processed message:', result);
                let cmd;
                if (result.chatsFrom === 'private') {
                    cmd = result.message;
                } else if (result.chatsFrom === 'group') {
                    cmd = result.participant ? result.participant.message : result.message;
                }
                if (cmd.startsWith(process.env.PREFIX)) {
                    const messageToProcess = cmd.replace(process.env.PREFIX, '').trim();
                    const response = await HytechHandle(messageToProcess);
                    sock.sendMessage(result.remoteJid, { text: response });
                }
                if (cmd.startsWith('.source')) {
                    sock.sendMessage(result.remoteJid, { text: `*Whastapp Bot OpenAI*

WhatsApp Chatbot is our project for AI-based conversations on WhatsApp messages using openAI technology.

- Github: https://github.com/HyTech-Group/wabot-openai
- Npm: https://www.npmjs.com/package/wabot-openai
- Official Website: https://hy-tech.my.id/` });
                }
            } catch (error) {
                console.error('Error processing message:', error);
            }
        });
    })
    .catch(error => {
        console.error('Error starting bot:', error);
    });