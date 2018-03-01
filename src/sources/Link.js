"use strict";
// const url = require('url');

module.exports = class Link {
  constructor(emoji, name, message, link) {
    this.emoji = emoji;
    this.name = name;
    this.message = message;
    this.href = link;
  }

  fetchData() {
    return {
      emoji: this.emoji,
      name: this.name,
      message: message,
      href: this.href
    };
  }
};