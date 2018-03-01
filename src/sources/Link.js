"use strict";
module.exports = class Link {
  constructor(emoji, name, message, url) {
    emoji: emoji;
    name: name;
    message: message
    href: new URL(url);
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