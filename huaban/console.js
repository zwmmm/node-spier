const readline = require('readline');

class Console {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        this.callback = []; // 存储问题
        this.events = []; // 存储事件
        this.results = []; // 存储答案
    }

    __question__(text) {
        return () => this.rl.question(`${text}: `, (answer) => {
            /**
             * 这里会在命令后回车之后触发
             */

            // 缓存答案
            this.results.push(answer);

            // 问题回答完了，可以结束了
            if (this.callback.length <= 0) {
                this.events.forEach(e => e(...this.results));
                return;
            }

            // 继续提问下一个问题
            this.callback.shift()();
        });
    }

    // 发起问答
    question(text) {
        // 第一次进来之后就重写question，让后面的问题都先缓存起来
        this.question = text => {
            this.callback.push(this.__question__(text));
            return this;
        }
        this.__question__(text)();
        return this;
    }

    // 结束问答
    end(callback) {
        this.events.push(callback);
    }

    close() {
        this.rl.close();
    }

    log(...arg) {
        console.log(...arg);
    }
}

module.exports = Console; 
