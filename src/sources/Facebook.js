"use strict";
const _ = require("lodash");
const moment = require("moment");
const FacebookSDK = require('facebook-node-sdk');
const config = require('config');

module.exports = class Facebook {
    constructor(emoji, name, pageId) {
        this.facebook = new FacebookSDK({
            appId: config.get('facebook.appID'),
            secret: config.get('facebook.secret')
        });

        this.emoji = emoji;
        this.id = pageId;
        this.name = name;
        this.href = 'https://www.facebook.com/' + this.id;
    }

    parseEntry(post) {
        return post.message;
    }

    _lookMenuFromTodaysPosts(posts, matcher) {
        // find only today's posts
        const todaysPosts = _.filter(posts, post => {
            return moment(post.created_time).startOf("day").diff(moment(), "days") === 0
        });

        return (_.find(todaysPosts, post => matcher.test(post.message)) || {}).message;
    }

    _lookForWeeklyMenu(posts, postMatcher, weekDays) {
        // start week with sunday, since some places might post their weekly menus on sunday
        const daysFromTheBeginningOfWeek = moment().diff(moment().startOf("week"), "days");

        const weekPosts = _.filter(posts, post => {
            return moment().diff(moment(post.created_time), "days") < daysFromTheBeginningOfWeek;
        });

        const menusPost = _.find(weekPosts, post => postMatcher.test(post.message));

        if (!menusPost) {
            return;
        }

        const currentDay = moment().day();
        const remainingDays = _.slice(weekDays, currentDay);
        const menuMatcherEnd = remainingDays.length ? remainingDays.join("|") : "$";
        const menuMatcher = new RegExp(`(${weekDays[currentDay - 1]})(.*?)(${menuMatcherEnd})`, "i");
        const menu = menusPost.message.replace(new RegExp("\n", "g"), " ").match(menuMatcher) || [];

        return menu.length && `${menu[1]}: ${menu[2]}`;
    }

    fetchData(weekDays) {
        const matcher = new RegExp(weekDays.join("|"), "i");
        const id = this.id.toString();

        return new Promise((resolve, reject) => {
            this.facebook.api(`/${id}/posts`, function(err, res) {
                if (err) {
                    return reject(err);
                }

                resolve(res.data);
            });
        })
        .then(posts => {
            let todaysMenu = this._lookMenuFromTodaysPosts(posts, matcher);

            if (!todaysMenu) {
                todaysMenu = this._lookForWeeklyMenu(posts, matcher, weekDays);
            }

            return {
                name: this.name,
                emoji: this.emoji,
                href: this.href,
                message: todaysMenu
            };
        })
        .catch(err => {
            console.log(err)
            return {
                name: this.name,
                emoji: this.emoji,
                href: this.href,
                message: "Restaurant not found!"
            }
        });
    }
}
