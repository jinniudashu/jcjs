import provider from '../../utils/provider.js';
import audioContext from '../../utils/audio.js';
const App = getApp();
const TIME = Date;
const requestAnimationFrame = requestAnimationFrame ||
  function requestAnimationFrame(callback) {
    return setTimeout(() => callback(TIME.now()), 100);
  };
let questionOptions = [];
const BUBBLE_NUM_KEY = 'BUBBLE_NUM_KEY';
const TIME_RATIO_KEY = 'TIME_RATIO_KEY';
const GameList_KEY = 'GameList_KEY';

Page({
  data: {
    imgUrls: App.globalData.adPictureUrl, 
    keyboard: ['', '0', ''],
    level: [
      { name: '2秒', value: 1 },
      { name: '4秒', value: 2 },
      { name: '6秒', value: 3 },
      { name: '不限时', value: 4, checked: true }
    ],
    answerKey: {},//答案
    start: true,
    answer: null,
    select: null,
    veriyResult:true,
    questionList: null,
    question: null,
    gameType: 0,
    timeRatio: 4,
    currIndex: 0,
    bubbleNum:0,
    veriyCalss: '',
    sliderValue:0,
    navTitle:'',
    isIpad:null
  },
  
  // imgH:function(e){
  //   //获取当前屏幕的宽度
  //   var winWid = wx.getSystemInfoSync().windowWidth;   
  //   var imgh=e.detail.height;　　　　　　　　　　　　　　　//图片高度
  //   var imgw=e.detail.width;
  //   //等比设置swiper的高度：
  //   // 屏幕宽度/swiper高度=图片宽度/图片高度==》swiper高度=屏幕宽度*图片高度/图片宽度
  //   var swiperH=winWid*imgh/imgw + "px";             
  //   this.setData({
  //       Hei:swiperH　　　　　　　　//设置高度
  //   })
  // },
 
// 训练过程返回
  navBack:function(e){
    this.playing = false;
    this.setData({
      start:true
    });
  },
 
  onLoad: function (options) {
    //取gamelist
    this.getGameList(); //
    //是否ipad
    this.setModel();
    //速度
    this.setRatio(); 
  },

  onHide:function() {
    this.pending = true;  //等待
  },

  onShow:function() {
    this.pending = false;
  },

//取gamelist
  getGameList(){
    wx.getStorage({
      key: GameList_KEY,
      success: (res) => {
        this.setData({
          gameList: res.data
        })
      },
      fail:(err)=>{
        this.initGameList();
      }
    })
  },

//缓存gamelist
  setGameList(){
    wx.setStorage({
      key: GameList_KEY,
      data: this.data.gameList,
    })
  },

//定义训练模块
  initGameList(){
    this.setData({gameList: [
      { value: '20以内进位加', m: '+' },
      { value: '20以内退位减', m: '-' },
      { value: '100以内进位加', m: '+' },
      { value: '100以内退位减', m: '-' },
      { value: '表内乘法', m: '×' },
      { value: '表内除法', m: '÷' }
    ]});
  },

  //取或设置速度条
  setRatio(value = null) {
    if (value !== null) {
      wx.setStorage({
        key: TIME_RATIO_KEY,
        data: value,
      })
    } else {
      wx.getStorage({
        key: TIME_RATIO_KEY,
        success: (res) => {
          const value = Math.abs(parseInt((res.data / 2) || 0) - 3) + 1; 
          this.setData({
            timeRatio: value,
            sliderValue: parseInt(res.data)
          }, this.init)
        },
        fail:(err)=>{
          this.init();
        }
      })
    }
  },

  //获得设备信息
  setModel() {
    const { model } = wx.getSystemInfoSync();
    const isIpad = model.toLowerCase().indexOf('ipad') >= 0;
    this.setData({
      isIpad
    })
  },

  //计算范围
  range(begin, end, step = 1) {
    let arr = [];
    for (let i = begin; i <= end; i += step) {
      arr.push(i);
    }
    return arr;
  },

//播放音频
  audioContext: null,
  playAudio(status, fullStatus) {
    if (this.audioContext) this.audioContext.destroy();
    this.audioContext = new audioContext({
      src: fullStatus ? 'assets/audio_100.mp3' : status ? 'assets/audio_success.mp3' : 'assets/audio_error.mp3'
    })
  },

  //开始一次练习
  provide: null,
  begin() {
    // const provide = this.provide = provider(this.data.gameType);
    const provide = this.provide = questionOptions[this.data.gameType];
    wx.setNavigationBarTitle({
      title: this.data.gameList[this.data.gameType].value,
    });
    this.setData({
      navTitle: this.data.gameList[this.data.gameType].value
    });
    this.setData({questionList: provide.get(20)}, () => {
      if (this.data.questionList.length) {
        this.setData({
          start: false,
          veriyResult:true,
          currIndex:0,
          showTips: false,
          result: [],
          isEnd: false
        })
        this.storageResult = [];
        this.timePerQ = provide.limit * (this.data.timeRatio === 4 ? 30 * 60: this.data.timeRatio);

        this.playing = true;
        this.pending = false;
        this.lastTime = TIME.now();
        this.updateProgress(this.lastTime);

        const questionList = this.data.questionList;
        let answerKey = this.data.answerKey || {};
        questionList.forEach(([key, value]) => {answerKey[key] = value});
        this.setData({answerKey})

      } else {
        // wx.showToast({
        //   title: '此栏目训练完成',
        //   icon: 'none'
        // })
        this.setData({showTips: true});
      }
    })
  },

  //关闭成绩提示页
  closeTips() {
    this.setData({showTips: false})
  },

  //从头继续挑战
  removeBegin() {
    questionOptions[this.data.gameType].remove()
      .then(this.init)
      .then(this.begin)
  },

  //进入下一单元
  nextSection() {
    const checkNext = () => {
      let gameType = this.data.gameType;
      let timeRatio = this.data.timeRatio;

      /**
       * @desc 判断是否到最后一个单元（困难难度）
       */
      if (((gameType + 1) === this.data.gameList.length) &&
        ((timeRatio) === 1)) {
        this.setData({
          showTips: false
        })
        wx.showModal({
          title: '提示',
          content: '往后没有训练了',
          showCancel: false,
          confirmText: '好的'
        })
        return;
      }
      /**
       * @desc 判断是否是困难难度（yes=>next,false =>next level）
       */
      if (timeRatio === 1) {
        timeRatio = 3;
        gameType++;
      } else {
        timeRatio--;
      }
      this.setData({
        timeRatio,
        gameType
      }, () => {
        this.init().then(() => {
          const progress = questionOptions[gameType].progress();
          const max = questionOptions[gameType].max();
          if (progress < max) {
            this.begin();
          } else {
            checkNext();
          }
        })
      })
    }

    checkNext();
  },

  //阻止冒泡
  preventMove() { return 0; },

  //练习初始化
  init() {
    return new Promise((resolve, rejest) => {
      questionOptions = [];
      Array.from(this.range(0, 5)).forEach((item, index) => {
        questionOptions.push(new provider(item, this.data.timeRatio))
      });
      this.getStatistics();
      this.setBubbleNum(); //获取气球数量
      resolve();
    })
  },

  //获得本次练习的对错统计数据
  getStatistics() {
    let gameList = this.data.gameList;
    gameList.forEach((item, index) => {
      // item.oValue = item.oValue || item.value;
      // item.value = `${item.oValue}(进度${questionOptions[index].progress()}/${questionOptions[index].max()})`;
      const max = questionOptions[index].max();
      const progress = questionOptions[index].progress();

      item.per = (progress / max).toFixed(2) * 100;
      item.max = max;
      item.progress = progress;
    })
    this.setData({
      gameList
    })
    this.setGameList();   //缓存进度
  },

  //回到首页
  tryAgain() {
    this.setData({
      isEnd: false,
      start: true
    });
    wx.setNavigationBarTitle({
      title: '基础计算过关',
    })
    this.init();
  },

  //调整速度条
  sliderChange(event) {
    let { value } = event.detail;
    const sliderValue = value;
    value = Math.abs(parseInt((value / 2) || 0) - 3) + 1; // level
    if ((value === this.data.timeRatio) || value === null || value === undefined) return;
    this.setRatio(sliderValue);
    this.setData({
      timeRatio: value,
      sliderValue: sliderValue
    }, this.init)
  },  

//计算过关
  bindPickerChange(event) {
    const { value } = event.target.dataset;
    if (value === null || value === undefined) return;
    this.setData({
      gameType: parseInt(value)
    }, this.begin)
  },

  checkAnswer(answer) {
    const question = this.data.questionList[this.data.currIndex][0];
    const ans = this.data.questionList[this.data.currIndex][1];
    const left = question.split(this.data.gameList[this.data.gameType].m); //÷
    const result = parseInt(ans) === parseInt(answer.join(''));
    return result;
  },

  sortedResult() {
    const result = this.data.result;
    this.setData({
      sortedResult: result.map(x => {
        x[2] = ((x[2] > 100 ? x[2] : 100) / 1000).toFixed(1); //100 = 0.1s
        return x;
      }).reverse()
    })
  },

  feedBack(isOk) {
    //veriyResult 答题结果 
    this.playAudio(isOk);
      this.pending = true;
      setTimeout(()=>{
        this.done();
      }, isOk? 20 : 2000)
    
    this.setData({
      veriyCalss: isOk ? 'green' : 'red',
      veriyResult: isOk
    });
  },

//输入答案
  input(event) {
    const { numKey, otherKey } = event.target.dataset;
    let answer = this.data.answer || [];
    const answerLen = answer.length;
    const qAnswerLen = this.data.questionList[this.data.currIndex][1].length;
    const checkAnswer = (answer) => {
      const question = this.data.questionList[this.data.currIndex][0];
      const ans = this.data.questionList[this.data.currIndex][1];
      const isOk = parseInt(ans) === parseInt(answer.join(''));
      this.feedBack(isOk);
    };

    if (numKey) {
      if (qAnswerLen === answerLen) return;
      answer.push(numKey);
      this.setData({
        answer
      }, () => {
        if (qAnswerLen === answerLen + 1) {
          checkAnswer(answer);
          return;
        };
      })
    } else if (otherKey) {
      switch (otherKey) {
        case 'Del':
          answer.splice(answerLen - 1, 1);
          this.setData({
            answer
          })
          break;
        case '0':
          if (qAnswerLen === answerLen) return;
          answer.push(otherKey);
          this.setData({
            answer
          }, () => {
            if (qAnswerLen === answerLen + 1) {
              checkAnswer(answer);
              return;
            };
          })
          break;
        case 'Next':
          this.next();
          break;
        default:
          return;
      }
    }
  },

  storageResult: [], //存储结果
  done(now = TIME.now()) {
    this.disabled = true;
    this.pending = true;

    const cost = now - this.lastTime;
    const ques = this.data.questionList[this.data.currIndex][0];
    let result = this.data.result || [];
    const data = [ques, this.checkAnswer(this.data.answer || []), cost, (this.data.answer || []).join(''), cost > this.timePerQ];
    result.push(data);
    this.storageResult.push(data);
    this.setData({
      result,
      veriyResult:true
    })
    setTimeout(this.next, 100);
  },

  uploadResult() {
    const data = {
      ver: 1,
      name: this.selected,
      timePerQ: this.timePerQ,
      total: this.totalTime,
      resultHead: ['q', 'right', 'cost', 'a', 'timeout'],
      result: this.storageResult,
    };
    this.provide.pushMany(this.data.result);
    this.provide.save();
  },

  next() {
    this.ans = '';
    let currIndex = this.data.currIndex;
    const quesLen = this.data.questionList.length;
    currIndex++;
    // currIndex = currIndex === (quesLen - 1)? currIndex :currIndex+1;
    this.setData({
      currIndex,
      inputValue: '',
      veriyCalss: '',
      answer: ''
    })
    this.qa = this.data.questionList[currIndex];
    
    if (!this.qa) {
      this.playing = false;
      this.curr = 0;
      this.uploadResult(); //保存结果
      this.sortedResult(); //显示结果
      this.calcResult();
      this.setData({
        start: true,
        isEnd: true,
        currIndex: 0
      })
      return;
    }
    this.pending = false;
    this.lastTime = TIME.now();
  },

  calcResult() {
    const allTime = () => {
      return this.data.result.map(a => a[2] * 1000); // x1000
    }

    const succRate = () => {
      const all = this.data.result.map(a => a[1]);
      const succ = all.filter(Boolean);
      return all.length ? ((succ.length / all.length) * 100).toFixed(0) : 0;
    }

    const totalTime = () => {
      return this.allTime.reduce((a, b) => a + b, 0);
    }

    const avgTime = () => {
      return this.allTime.length ? ((this.totalTime / this.allTime.length) / 1000).toFixed(1) : 0;
    }

    const maxTime = () => {
      return this.allTime.length ? (Math.max(...this.allTime) / 1000).toFixed(1) : 0;
    }
    const minTime = () => {
      return this.allTime.length ? (Math.min(...this.allTime) / 1000).toFixed(1) : 0;
    }

    this.allTime = allTime();
    this.totalTime = totalTime();

    this.setData({
      allTime: this.allTime,
      succRate: succRate(),
      totalTime: this.totalTime ? (this.totalTime / 1000).toFixed(1) : 0,
      avgTime: avgTime(),
      maxTime: maxTime(),
      minTime: minTime()
    },()=>{
      if (this.data.succRate == 100) {
        this.playAudio(1,1);
        this.getBubbleNum()
          .then(data => {
            data += 1;
            wx.setStorage({
              key: BUBBLE_NUM_KEY,
              data,
            })
          })
          .catch(err => {
            wx.setStorage({
              key: BUBBLE_NUM_KEY,
              data: 1,
            })
          })
      }
    })
  },

  //设置气球数量
  setBubbleNum() {
    this.getBubbleNum()
      .then(data => {
        this.setData({
          bubbleNum:data
        })
      })
      .catch(err => {
        this.setData({
          bubbleNum: 0
        })
      })
  },

  //从缓存取气球数量
  getBubbleNum() {
    return new Promise((resolve,reject)=>{
      wx.getStorage({
        key: BUBBLE_NUM_KEY,
        success: (res) => resolve(res.data),
        fail: reject
      })
    })
  },

  // @desc 更新
  disabled: false,
  allTime: 0,
  totalTime: 0,
  adp: 0,
  pending: false,
  playing: false,
  lastTime: 0,
  updateProgress() {
    const now = TIME.now();
    const elsp = now - this.lastTime;
    if (this.playing) {
      requestAnimationFrame(this.updateProgress);
    }
    if (this.pending) return;
    if (this.disabled && elsp > 300) {
      this.disabled = false;
    }
    const left = this.timePerQ - elsp;
    if (left <= 0) {
      this.feedBack(false);
    }
    // if (this.$refs.progressBar) {
    //   this.$refs.progressBar.value = elsp;
    // }
  },

  onShareAppMessage: function () {
    return {
      title: '基础计算过关',
      imageUrl:'/assets/img-share.png',
      path: '/pages/learn/learn'
    }
  }
})