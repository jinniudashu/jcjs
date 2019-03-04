function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length; i; i -= 1) {
    const j = Math.floor(Math.random() * i);
    [a[i - 1], a[j]] = [a[j], a[i - 1]];
  }
  return a;
}

function score(limit, old, right, cost) {
  return ((old && old.score) ? old.score : 0 * 0.9) + (!right ? -30 : (20 + ((1 - ((cost - 300) / limit)) * 12)));
}

function tail(a) {
  return a.slice(1);
}

function isStorageAvailable(type) {
  try {
    const storage = window[type];
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return false;
  }
}

const storageType = 'localStorage';
const storageAvailable = isStorageAvailable(storageType);

function storageGet(key) {
  // if (!storageAvailable) {
  //   return undefined;
  // }
  // return window[storageType].getItem(key);
  return wx.getStorageSync(key);
}

function storageSet(key, data) {
  // if (storageAvailable) window[storageType].setItem(key, value);
  wx.setStorage({
    key,
    data,
  })
}

export default class {
  constructor(name, qas, limit) {
    this.qas = qas;
    this.passTimes = 3;
    this.limit = limit * 1000;
    this.name = name;
    const scores = storageGet(name);
    this.scores = scores ? scores : {};
  }

  save() {
    storageSet(this.name, this.scores);
    // storageSet(this.name, JSON.stringify(this.scores));
  }

  pushResult(result) {
    const [q, right, cost, ans, timeout] = result;
    const old = this.scores[q] || 0;
    // const times = this.scores[q] && this.scores[q].rightTimes ? this.scores[q].rightTimes : 0;
    // const times = right ?
    //   (old ? old.rightTimes : 3) :
    //   (old ? old.rightTimes : 0); //累计三次
    const times = right ?
      (old ? old.rightTimes : 3) :
      0 ; //连续三次

    this.scores[q] = {
      score: score(this.limit, old, right, cost),
      rightTimes: right ? times + 1 : times
    }
  }

  pushMany(results) {
    results.forEach(this.pushResult, this);
  }

  get(num) {
    const scores = this.scores;
    const qas = this.qas.map(([q, a]) => {
      if (scores[q] && scores[q].rightTimes >= this.passTimes) {
        return [];
      } else {
        return [scores[q] ? scores[q].score : Math.random(), q, a]
      }
    })
      .sort(([a], [b]) => a - b)
      .filter(([q]) => !!q)
      .map(tail).splice(0, num);
    return shuffle(qas);
  }

  progress() {
    // return Object.values(this.scores).filter(s => s.rightTimes >= this.passTimes).length;
    let resultArr = [];
    const scores = this.scores;
    for (let key in scores) {
      resultArr.push({ score: scores[key].score, rightTimes: scores[key].rightTimes});
    }
    return resultArr.filter(s => s.rightTimes >= this.passTimes).length;
  }

  max() {
    return this.qas.length;
  }

  remove() {
  //  return wx.removeStorageSync(this.name);
   return new Promise((resolve,reject)=>{
     wx.removeStorage({
       key: this.name,
       success: resolve,
       fail:reject
     })
   })
  }

  rate() {
    const [max, progress] = [this.max(), this.progress()];
    if (max !== progress) {
      return 0;
    }
    return Object.values(this.scores).reduce((a, b) => a + b, 0) / max;
  }
}
