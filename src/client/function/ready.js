const config = require('../config/bot_config.json');

module.exports.execute = async (client) => {
    setInterval(() => {
        client.user.setActivity(`${config.durum}`);
    }, 5000);
    console.log(`> "${config.name}" Bot active for discord`);

};

module.exports.config = {
    name: "ready",
    once: true
};
