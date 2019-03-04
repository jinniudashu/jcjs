import question from './question.js';
import generate from './generate.js';
const selectT = ['20In+', '20In-', '100In+', '100In-', '9x', '9/'];
export default function (select,level) {
  switch (selectT[select]) {
    case '20In+':
      return new question(`20+${level}`, generate.in20(1), 2)
      break;
    case '20In-':
      return new question(`20-${level}`, generate.in20(-1), 2)
      break;
    case '100In+':
      return new question(`100+${level}`, generate.in100(1), 2)
      break;
    case '100In-':
      return new question(`100-${level}`, generate.in100(-1), 2)
      break;
    case '9x':
      return new question(`9x${level}`, generate.xTable(1), 2)
      break;
    case '9/':
      return new question(`9/${level}`, generate.xTable(-1), 2)
      break;
    default:
      return null;
  }
}
