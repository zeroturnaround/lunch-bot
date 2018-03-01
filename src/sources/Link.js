"use strict";
module.exports = class Link {
  constructor(emoji, name, message, url) {
    this.emoji = emoji;
    this.name = name;
    this.message = message;
    this.href = new URL(url)
  }

  fetchData() {
    return {
      emoji: this.emoji,
      name: this.name,
      message: message,
      href: this.url
    };
  }
}