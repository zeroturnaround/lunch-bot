"use strict";

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
      message: this.message,
      href: this.href
    };
  }
};