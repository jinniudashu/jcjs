export default class {
  constructor(options) {
    // options =  Object.assign(options,{});
    const innerAudioContext = wx.createInnerAudioContext();
    innerAudioContext.autoplay  = true;
    innerAudioContext.src = options.src;
    innerAudioContext.volume = 0.5;
    return innerAudioContext;
  }
}