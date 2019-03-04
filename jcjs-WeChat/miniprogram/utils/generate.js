function range(begin, end, step = 1) {
  let arr = [];
  for (let i = begin; i <= end; i += step) {
    arr.push(i);
  }
  return arr;
}
//生成题库数组，共954道题
const createQuestion = {
  in20: function (addOrMinus) {
    let questionBank = new Array()
    if (addOrMinus > 0) {
      // 生成20以内进位加
      for (var i = 9; i > 0; i--) {
        for (var j = 9; i + j >= 10; j--) {
          var test = [
            i + "+" + j,
            `${i + j}`
          ]
          questionBank.push(test)
        }
      }
      return questionBank;
    } else {
      // 生成20以内退位减
      for (var i = 11; i < 20; i++) {
        for (var j = 9; i - j <= 10; j--) {
          var test = [
            i + "-" + j,
            `${i - j}`
          ]
          questionBank.push(test)
        }
      }
      return questionBank;
    }
  },

  in100: function (addOrMinus) {
    let questionBank = new Array()
    if (addOrMinus > 0) {
      //生成100以内进位加
      for (var i = 9; i > 0; i--) {
        for (var j = 11; i + j <= 100; j++) {
          var test = [
            i + "+" + j,
            `${i + j}`
          ]
          if (parseInt(test[1] / 10) > parseInt(j / 10)) {
            questionBank.push(test)
          }
        }
      }

      return questionBank;
    } else {
      // 生成100以内退位减
      for (var i = 9; i > 0; i--) {
        for (var j = 20; j < 101; j++) {
          var test = [
            j + "-" + i,
            `${j - i}`
          ]
          if (parseInt((test[1]) / 10) < parseInt(j / 10)) {
            questionBank.push(test)
          }
        }
      }
      return questionBank
    }
  },

  xTable: function (xTable) {
    let questionBank = new Array()
    if (xTable > 0) {
      //乘法
      for (var i = 1; i < 10; i++) {
        for (var j = 9; j > i - 1; j--) {
          var test = [
            i + "x" + j,
            `${i * j}`
          ]
          questionBank.push(test)
        }
      }
      return questionBank;
    } else {
      //除法
      for (var i = 1; i < 10; i++) {
        for (var j = 1; j < 10; j++) {
          var test = [
            j * i + "÷" + i,
            `${j}`
          ]
          questionBank.push(test)
        }
      }
      return questionBank //返回题库数组954题
    }
  }
}

export default createQuestion;
