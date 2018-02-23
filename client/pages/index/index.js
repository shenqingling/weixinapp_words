
Page({

  data: {
    search: '',
    word: '',
    words: [],
    description: {}, 
    uk: false, 
    ukLoop: false, 
    us: false, 
    usLoop: false,
    examples: []
  },

  onReady: function (e) {
    // 使用 wx.createInnerAudioContext 获取 audio 上下文 context
    this.audioUkCtx = wx.createInnerAudioContext()
    this.audioUsCtx = wx.createInnerAudioContext()
    this.audioUkLoopCtx = wx.createInnerAudioContext()
    this.audioUkLoopCtx.loop = true
    this.audioUsLoopCtx = wx.createInnerAudioContext()
    this.audioUsLoopCtx.loop = true

    this.audioUkCtx.onEnded((res) => {
      this.setData({
        uk: false
      })
    })

    this.audioUsCtx.onEnded((res) => {
      this.setData({
        us: false
      })
    })

    // this.audioUkLoopCtx.onEnded((res) => {
    //   this.setData({
    //     ukLoop: false
    //   })
    // })

    // this.audioUsLoopCtx.onEnded((res) => {
    //   this.setData({
    //     usLoop: false
    //   })
    // })
  },

  // 单词查询输入框输入回调
  bindWordInput: function(e){
    this.setData({
      search: e.detail.value
    })
  },

  // 单词查询
  wordSearch: function (event) {
    const { search: s, words } = this.data;
    const {target: {dataset: {search = s}}} = event;
    // 添加进最近查询列表
    const sin = words.indexOf(search);
    if (sin < 0 && search) {
      words.unshift(search);
    }
    // 最近查询列表只保存最近10个查询单词
    if (words.length > 10){
      words.shift();
    }
    
    this.setData({
      word: search,
      search: '',
      words
    });
    
    wx.request({
      url: `https://api.shanbay.com/bdc/search/?word=${search}`,
      success: (res) => {
        const { msg, status_code, data} = res.data;
        const { id, uk_audio, us_audio } = data;
        this.setData({ description: status_code ? {definition: msg, id: -1} : data });
        this.audioUkCtx.src = uk_audio;
        this.audioUkLoopCtx.src = uk_audio;
        this.audioUsCtx.src = us_audio;
        this.audioUsLoopCtx.src = us_audio;
        this.exampleSearch(id);
      }
    })
  },

  // 例句查询
  exampleSearch: function(vocabulary_id){
    // https://api.shanbay.com/bdc/example/?vocabulary_id={id}&type={type}
    wx.request({
      url: `https://api.shanbay.com/bdc/example`,
      data: {
        vocabulary_id,
        type: 'sys'
      },
      success: (res) => {
        const { msg, status_code, data } = res.data;
        const [uk, ukLoop, us, usLoop] = [false, false, false, false];
        this.setData({ examples: !status_code ? data : [], uk, ukLoop, us, usLoop });
      }
    })
  },

  // 英语发音
  audioUkPlay: function (event) {
    const { target: { dataset: { loop } } } = event;
    const { ukLoop: ukl } = this.data;
    let [uk, ukLoop, us, usLoop] = [false, false, false, false];
    this.audioUsCtx.pause()
    this.audioUsLoopCtx.pause()
    if (loop && ukl){
      this.audioUkLoopCtx.pause()
    } else if (loop){
      this.audioUkCtx.pause()
      this.audioUkLoopCtx.play()
      ukLoop = true
    }else {
      this.audioUkLoopCtx.pause()
      this.audioUkCtx.play()
      uk = true
    }

    this.setData({
      uk,ukLoop, us, usLoop
    })
  },
  // 美语发音
  audioUsPlay: function (event) {
    const { target: { dataset: { loop } } } = event;
    const { usLoop: usl } = this.data;
    let [uk, ukLoop, us, usLoop] = [false, false, false, false];
    this.audioUkCtx.pause()
    this.audioUkLoopCtx.pause()
    if (loop && usl){
      this.audioUsLoopCtx.pause()
    }else if (loop) {
      this.audioUsCtx.pause()
      this.audioUsLoopCtx.play()
      usLoop = true
    } else {
      this.audioUsLoopCtx.pause()
      this.audioUsCtx.play()
      us = true
    }
    this.setData({
      uk, ukLoop, us, usLoop
    })
  },

  // 登录
  login: function(){
    const id = this.wordId;
    if(!id){
      return;
    }
    
    wx.request({
      url: `https://api.shanbay.com/bdc/learning`,
      data: {
        id
      },
      success: (res) => {
       console.log(res)
      }
    })
  }
})