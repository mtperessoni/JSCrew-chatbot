var Botkit = require('./node_modules/botkit/lib/Botkit.js');
var firebase = require("firebase/app");
require("firebase/auth");
require("firebase/database");
require("firebase/firestore");
require("firebase/messaging");
require("firebase/functions");

var config = {
    apiKey: "AIzaSyDHhQDMCF1HLUzDKQAqG7MidvluZpmBFJ4",
    authDomain: "jscrewproject.firebaseapp.com",
    databaseURL: "https://jscrewproject.firebaseio.com",
    projectId: "jscrewproject",
    storageBucket: "jscrewproject.appspot.com",
    messagingSenderId: "564559076333"
};



var controller = Botkit.slackbot({
    debug: true,
    replyWithTyping: true,
});

var bot = controller.spawn({
    token: 'xoxb-405435353380-405492100420-3lYiUI9xFSz3xx15U63DI6AA'
}).startRTM();

firebase.initializeApp(config);

controller.hears(['help'], 'direct_message', function (bot, message) {
    var mensagem = "Comandos existentes:\n " +
        "*comandos*: Lista todas as chaves que possuem uma url\n" +
        "*full-comandos*: Lista todas as chaves e suas respectivas urls associadas\n" +
        "*save apelido-url url*: Salva na base um apelido que quando chamado é exibida a url a associada a ele\n" +
        "*update apelido-antigo apelido-novo*: Altera o nome do apelido"

    bot.reply(message, mensagem);
});

controller.hears(['comandos'], 'direct_message', function (bot, message) {
    var base = firebase.database().ref('comandos');
    base.on('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            bot.reply(message, "Chave: " + childSnapshot.key);
        });
    });
});

controller.hears(['full-comandos'], 'direct_message', function (bot, message) {
    var base = firebase.database().ref('comandos');
    base.on('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            var childData = childSnapshot.val();
            var id = childData.id;

            bot.reply(message, "Chave: " + childSnapshot.key + " | URL: " + childData.url);
        });
    });
});

controller.hears(['planilha-.*'], 'direct_message,direct_mention,mention', (bot, message) => {
    var base = firebase.database().ref('comandos');

    base.once('value').then((snapshot) => {
        snapshot.forEach((childSnapshot) => {
            if (childSnapshot.key.startsWith('planilha')) {
                var key = childSnapshot.key;
                var childData = childSnapshot.val();

                if (key == message.text) {
                    console.log((childData.url).replace("<", "").replace(">", ""));
                    var reply = {
                        as_user: true,
                        attachments: [
                            {
                                "text": (childData.url).replace("<", "").replace(">", ""),
                                "title-link": (childData.url).replace("<", "").replace(">", ""),
                            }
                        ]
                    }
                    bot.reply(message, reply);
                }
            }

        });
    });
});


controller.hears(['save .*'], 'direct_message,direct_mention,mention', (bot, message) => {
    var split = message.text.split(" ");
    var base = firebase.database().ref('comandos');
    console.log('Mensagem:' + message.text);
    if (split.length == 3) {
        var comando = split[1];
        console.log(split[2]);
        base.child(comando).set({
            url: split[2].replace("<", "").replace(">", ""),
        });
    }
});

controller.hears(['update .*'], 'direct_message,direct_mention,mention', (bot, message) => {
    var split = message.text.split(" ");
    var base = firebase.database().ref('comandos');

    if (split.length == 3) {
        var newKey = {};
        var nomeComando = split[1];
        var novoComando = split[2];
        var oldUrl = '';

        base.once('value').then((snapshot) => {
            snapshot.forEach((childSnapshot) => {
                if (childSnapshot.key == nomeComando) {
                    oldUrl = childSnapshot.val().url;
                    base.child(nomeComando).remove();
                    base.child(novoComando).set({
                        url: oldUrl,
                    });
                    return
                }
            });

        });
    }
});


controller.hears(['.*'], 'direct_message,direct_mention,mention', function (bot, message) {
    var split = message.text.split(" ");
    var base = firebase.database().ref('comandos');

    split.forEach((mensagem) => {
        base.once('value').then((snapshot) => {
            snapshot.forEach((childSnapshot) => {
                var key = childSnapshot.key;
                var childData = childSnapshot.val();

                if (key == mensagem) {
                    console.log((childData.url).replace("<", "").replace(">", ""));
                    var reply = {
                        as_user: true,
                        attachments: [
                            {
                                "text": "",
                                "image_url": (childData.url).replace("<", "").replace(">", ""),
                            }
                        ]
                    }
                    bot.reply(message, reply);
                }

            });
        });
    });
});