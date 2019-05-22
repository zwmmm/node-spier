const path = require('path');
const Console = require('./console');
const fetch  = require('./fetch');
const fs = require('fs');
const request = require('request');

const rl = new Console();

rl.question('请输入关键词')
  .question('请输入下载数量')
  .end(async (key, num) => {

      try {
          if (!key || !num) {
              rl.log('输入错误');
              rl.close();
              return;
          }

          rl.log('开始查找图片...');

          const ret = await fetch(`https://huaban.com/search/?q=${encodeURIComponent(key)}&per_page=${num}`);
          const pins = [...ret.pins];
          // 按照点赞数排列下
          pins.sort((a, b) => b.repin_count - a.repin_count);

          // 图册id；
          const finish = [];
          let count = 0; // 计算成功数量

          rl.log('已经搜索到相关图片，正在为您下载中...');

          pins.forEach(img => {
              const key = img.file.key;
              // 创建文件流
              let writeStream = fs.createWriteStream(path.join(__dirname, `/images/${key}.png`));

              // 请求图片直接流入对应的文件中，则完成下载
              request(`http://img.hb.aicdn.com/${key}_fw658`)
              .pipe(writeStream);

              // 监控下载是否成功。
              finish.push(new Promise(resolve => {
                  writeStream.on("finish", function() {
                      count++;
                      console.log(key, '下载成功');
                      writeStream.end();
                      resolve();
                  });
              }));
          })

          Promise.all(finish).then(() => {
              console.log(`下载图片完成, 成功下载${count}张，${pins.length - count}次下载失败`);
              rl.close();
          })
      } catch (e) {
          rl.log(e.message, '图片下载失败');
          rl.close();
      }
  })


// 花瓣图片规则，加上后缀_fw86 为缩略图 _fw658 为正常图片
//7fae724ac9d9a95528cc1cc68a9b71ec75857d2d2ad12-ehsx2w_fw86
//img.hb.aicdn.com/7fae724ac9d9a95528cc1cc68a9b71ec75857d2d2ad12-ehsx2w_fw86
//img.hb.aicdn.com/a3038e3b6cba2c84133f7d8a73d1b1ef8019937b92b71-O6ud34_fw658
