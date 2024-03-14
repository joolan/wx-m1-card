var closeTimeout = 2000
var nfc = null
var mc = null
var accessData = {
	key: "FFFFFFFFFFFF", //默认密钥
	winShow:"",
  keyType: "B",
  keyT: null,
	readArea:[],
  content: "",
  tagId: null,
  readRes: [],
  receiver: null,
}
const _handle = (tag) => {
  accessData.tagId = new Int8Array(tag.id)
  mc = nfc.getMifareClassic()
  // 尝试连接
  mc.connect({
    success: function (res) {
			console.log("MifareClassic 连接成功：", res)
			accessData.receiver.setData({ winShow: " " })
    },
    fail: function (res) {
			console.log("MifareClassic 连接失败", res)
			if(res.errCode !=13022){
			wx.showToast({
				title: '读卡失败',
				icon: "none",
				mask: true,
			})
			accessData.receiver.setData({ winShow: " " })
			
		}
    }
	})

  // 认证并读取数据
  _authRead()

}
const _read = () => {
  mc.isConnected({
    success: function (res) {
      console.log(sector,"标签已连接，尝试读取： ", res)
			//accessData.readRes = []
			var sector = accessData.readArea[0][0]
			var block = accessData.readArea[0][1]
			accessData.readArea.shift();
        let currentReadBuffer = new Int8Array(2)
        currentReadBuffer[0] = parseInt("0x30")
        currentReadBuffer[1] = parseInt(4 * parseInt(sector) + block, 10)
        mc.transceive({
          data: currentReadBuffer.buffer,
          success: function (res) {
						console.log("读取 block 成功：", res)
						console.log("读取 block 数据ASCII码array：", new Uint8Array(res.data))
						let content = ""
						let o = new Uint8Array(res.data)
            for (let r = 0; r < o.length; r++) {
              var c = o[r].toString(16);
              c.length < 2 && (c = "0" + c), r == o.length - 1 ? content += c : content += c + ":";
            }
						console.log(content)
						accessData.readRes.push(content)

						if (accessData.readArea.length>0){ //读取下一个区块
							_authRead()
						}else{
							accessData.receiver.setData({ result: accessData.readRes })
							wx.showModal({
								title: '读卡结束',
								content: JSON.stringify(accessData.readRes),
								success: function (res) {
									if (res.confirm) {//这里是点击了确定以后
										console.log('用户点击确定')
									} else {//这里是点击了取消以后
										console.log('用户点击取消')
									} 
								}
							})
						}

						

          },
          fail: function (res) {
            console.log(sector,'--',block,"读取 block 失败，使用密钥", accessData.keyType, "：", accessData.key, " 返回内容：", res)
          }
				})
      
      setTimeout(() => {
        _close()
      }, closeTimeout);
    }
  })
}

const _authRead = () => {
	//var block=0
	if(accessData.readArea.length<1) {return}
	var sector = accessData.readArea[0][0]
	var block = accessData.readArea[0][1]
	if(accessData.readArea[0][2] !=''){
	accessData.key = accessData.readArea[0][2]
	}
  var authData = new Int8Array(12)
  authData[0] = accessData.keyT
  authData[1] = parseInt(4 * parseInt(sector), 10)
  for (let i = 0; i < accessData.tagId.length; i++) {
    authData[i + 2] = accessData.tagId[i]
	}
	//  指令+ 区块 + tagid + 密钥
  // 填充密钥
  authData[6] = _hex2Int(accessData.key.substring(0, 2))
  authData[7] = _hex2Int(accessData.key.substring(2, 4))
  authData[8] = _hex2Int(accessData.key.substring(4, 6))
  authData[9] = _hex2Int(accessData.key.substring(6, 8))
  authData[10] = _hex2Int(accessData.key.substring(8, 10))
  authData[11] = _hex2Int(accessData.key.substring(10, 12))

  mc.transceive({
    data: authData.buffer,
    success: function (res) {
			console.log("[",parseInt(authData[1]/4),"]认证成功信息：", res.data)
			_read()
		
					
					setTimeout(() => {
						_close()
					}, closeTimeout);

    },
    fail: function (res) {
			console.log("[",parseInt(authData[1]/4),"]认证失败信息：", res)
			wx.showToast({
				title: '读卡校验失败，可能是无效卡或非本店卡',
				icon: "none",
				mask: true,
				duration: 2000
			})

			setTimeout(() => {
        _close()
      }, closeTimeout-1000);
			
    }
	})
	
	
}

const _hex2Int = (e) => {
  for (var a, r = e.length, c = new Array(r), s = 0; s < r; s++) 48 <= (a = e.charCodeAt(s)) && a < 58 ? a -= 48 : a = (223 & a) - 65 + 10,
    c[s] = a;
  return c.reduce(function (e, a) {
    return e = 16 * e + a;
  }, 0);
}
const _ascii2string = (e) =>{
	let content = ""
	for (var o = e, r = 0; r < o.length; r++) {
		//var c = o[r].toString(16);
		var c = String.fromCharCode(o[r])
		//console.log('本次需解析ascii=',o[r],'--------',c)
		if (31<o[r] && o[r]<127){ // 32-126 有效字符可做为会员卡号
			content+=c
			//console.log(o[r],'----',c)
		}else{
			console.log('有不可见ascii字符',o[r])
			//content+='不可见字符'+o[r]
		}
	}
	return content;

}

const _init = () => {
	_close()
  nfc = wx.getNFCAdapter()
  nfc.startDiscovery({
		fail(err){
			console.log(err)
			if(err.errCode !=13021){
			accessData.receiver.setData({ winShow: " " })
				let msg=err.errMsg
				if(err.errCode ==13001){msg='系统NFC开关未打开'}
				if(err.errCode ==13019){msg='用户未授权应用NFC权限'}
				if(err.errCode ==13016){msg='连接失败'}

			wx.showToast({
				title: '失败，请确认当前系统支持NFC'+msg,
				icon: "none",
				mask: true,
				duration: 2000
			})
			
		}
			
		} 
	})
	nfc.onDiscovered(_handle)
}
const _close = () => {
  mc && mc.close({
    complete: function (res) {
      console.log("MifareClassic close", res)
    }
  })
  nfc && nfc.offDiscovered(_handle)
  nfc && nfc.stopDiscovery({
		fail: function(res){
			accessData.receiver.setData({ winShow: " " })
			//console.log("stopDiscovery1", error)
			wx.showToast({
				title: '操作失败'+res.errMsg,
				icon: "none",
				mask: true,
				duration: 2000
			})
		},
    complete: function (res) {
      console.log("stopDiscovery", res)
    }
  })
  mc = null
  nfc = null
}

module.exports = {
  read: function (receiver = null) { //readArea = [[1,0,'key'],[15,0,'key']],
		let keyType='B'
		accessData.keyType = keyType
    //accessData.key = '' //可直接赋值key写死
    keyType == "A" ? accessData.keyT = parseInt("0x60") : accessData.keyT = parseInt("0x61")
    accessData.readRes = []
		accessData.receiver = receiver
		accessData.readArea = receiver.data.readArea
		_init()
  },
  close: function () {
    _close()
  },
  getReadRes() {
    return accessData.readRes
  }
}