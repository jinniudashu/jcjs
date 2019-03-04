// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: 'peiwaxue1'})
const db = cloud.database()
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  try {
    return await db.collection('logs').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        openid: wxContext.OPENID,
        createtime: db.serverDate(),
        operate: event.behavior,
        content: event.content
       }
    })
  } catch (e) {
    console.error(e)
  }

  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}