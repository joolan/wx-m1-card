var closeTimeout = 2000
var nfc = null
var mc = null
var accessData = {
  key: "",
  keyType: "A",
  keyT: null,
 
  sector: 1,
	block: 4,
	rblock: 0,
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
    },
    fail: function (res) {
      console.log("MifareClassic 连接失败", res)
    }
	})
	//accessData.sector=1 
	//accessData.block=0
  // 认证
  _auth(accessData.sector)
  // 读取
//	_read(1,0)
//accessData.sector=15 
//_auth(accessData.sector)
	//_auth(15)
  // 读取
	//_read(15,0)

}
const _read = (sector,block) => {
  mc.isConnected({
    success: function (res) {
      console.log(sector,"标签已连接，尝试读取： ", res)
			//accessData.readRes = []

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

            if (accessData.receiver) {
							//获取到值
							accessData.receiver.setData({ result: accessData.readRes })
							if (sector==1){
							accessData.receiver.setData({ icNo: content })
							accessData.sector=15
							_auth(accessData.sector,0)
							console.log('icNO-HEX',content)
							}else if(sector==15){
							accessData.receiver.setData({ cardNo: _ascii2string(o) })
							accessData.readRes = [] //2个扇区读完清除数据
							console.log('会员卡号',_ascii2string(o))
						}
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

const _auth = (sector,block=0) => {
	//var block=0
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
			_read(sector,block)
		
					
					setTimeout(() => {
						_close()
					}, closeTimeout);

    },
    fail: function (res) {
      console.log("[",parseInt(authData[1]/4),"]认证失败信息：", res)
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
    success: function (res) {
			//nfc.onDiscovered(_handle)
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
    complete: function (res) {
      console.log("stopDiscovery", res)
    }
  })
  mc = null
  nfc = null
}

module.exports = {
  read: function (sector=1,block=0,receiver = null) {
		let keyType='B'
		accessData.keyType = keyType
    accessData.key = 'FFFFFFFFFFFF'
    keyType == "A" ? accessData.keyT = parseInt("0x60") : accessData.keyT = parseInt("0x61")
		accessData.sector = sector  // 1扇区ic卡号
		accessData.block = block

    //ccessData.readRes = []
    accessData.receiver = receiver
		accessData.sector=1
		_init()
		//accessData.sector=15
		//_init()

	
  },
  close: function () {
    _close()
  },
  getReadRes() {
    return accessData.readRes
  }
}