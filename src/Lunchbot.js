"use strict";
const Bot = require('slackbots');
const _ = require("lodash");

module.exports = class LunchBot extends Bot {
    constructor(settings, sources) {
        super(settings);

        this.weekDays = ["esmaspäev", "teisipäev", "kolmapäev", "neljapäev", "reede"];
        this.actionTerms = ['menu', 'offer', 'lunch'];
        this.messageTypes = ['C', 'G'];
        this.settings = settings;
        this.sources = sources;
    }

    run() {
        this.on('start', this._getBot);
        this.on('message', this._onMessage);

        console.log('LunchBot running');
    }

    _getBot() {
        const name = this.settings.name.toLowerCase();
        this.bot =  _.find(this.users, { name });
    }

    _isValidMessage(message) {
        if (message.type !== 'message') {
            return false;
        }

        // Ignore messages from other bots
        if (message.subtype === 'bot_message') {
            return false;
        }

        // Ignore anything other than messages in groups and channels
        if (typeof message.channel !== 'string' || !_.includes(this.messageTypes, message.channel[0])) {
            return false;
        }

        // Ignore our own messages
        if (message.user === this.bot.id) {
            return false;
        }

        // Ignore messages not mentioning us
        if (!message.text.includes(`<@${this.bot.id}>`)) {
            return false;
        }

        return true;
    }

    _containsAny(text, keywords) {
        return _.some(keywords, keyword => text.indexOf(keyword) !== -1);
    }

    _makeAttachments(sourceData) {
        const nothingMsg = "_Couldn't find anything, sorry!_ :disappointed:";
        const title = `:${sourceData.emoji}: ${sourceData.name} - <${sourceData.href}|Source>`;

        return {
            title,
            text: sourceData.message || nothingMsg,
            "mrkdwn_in": ["text"]
        };
    }

    _addReactions(responseData, sourcesData) {
        const { ts, channel } = responseData;

        _.forEach(sourcesData, source => {
            this._api('reactions.add', {
                timestamp: ts,
                channel: channel,
                name: source.emoji
            });
        });
    }

    _showMenus(message) {
        Promise.all(
            _.map(this.sources, source => source.fetchData(this.weekDays))
        )
        .then(sourcesData => {
            const attachments = _.map(sourcesData, this._makeAttachments);

            this.postMessage(message.channel, undefined, {
                icon_emoji: ":fork_and_knife:",
                attachments: JSON.stringify(attachments)
            })
            .then(responseData => this._addReactions(responseData, sourcesData));
        })
        .catch(err => console.log(err));
    }

    _onMessage(message) {
        if (this._isValidMessage(message)) {
            if (this._containsAny(message.text, this.actionTerms)) {
                this._showMenus(message);
            }
        }
    }
}
