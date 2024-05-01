function generateTimeStamp(date){
  return Utilities.formatDate(date, 'JST', 'yyyy/MM/dd HH:mm:ss')
}

function generateTrimedImg(folder, imageBlob, cropValue, unit='pixel'){
  const object ={
    blob: imageBlob,
    unit: unit,
    crop: cropValue // cropValue {t:400, b:1200, l:0, r:0}
  }

  // https://github.com/tanaikech/ImgApp#4-editimage
  let trimedImgBlob = ImgApp.editImage(object)
  let trimedImgInfo = folder.createFile(trimedImgBlob)

  const trimedImgfileId = trimedImgInfo.getId()
  let trimeImgFileName = trimedImgInfo.getName()
  trimeImgFileName = 'trimed_' + trimeImgFileName
  trimedImgInfo.setName(trimeImgFileName)

  return trimedImgInfo
}

function getOCRData(imageFileId){
  const ocrImage = Drive.Files.copy(resource, imageFileId, option)
  ocr_data = DocumentApp.openById(ocrImage.id).getBody().getText();
  Drive.Files.remove(ocrImage.id)
  return ocr_data.replace(/\r?\n/g,"").replace(/\s+/g,"")
}

function getDate(text){
  let res = /([0-9]{4})(\/|年)([0-9]{1,2})(\/|月)([0-9]{1,2})(\/|日)(0|[0-9]|1[0-9]|2[0-3])(\/|時)([0-5][0-9])(\/|分)([0-5][0-9])(\/|秒)/.exec(text)
  const date_text = res[0]
  let year, month, day
  [year, month, day] = [res[1], res[3], res[5]]
  return {"matchStr": date_text, "timestamp": `${year}/${month}/${day}`}
}

function getMoneyValue(text){
  console.log("input:", text)
  //金額を抽出
  // ref: https://www.megasoft.co.jp/mifes/seiki/s012.html
  let res = /\d{1,3}(,\d{3})*/.exec(text)
  console.log("match:", res)
  return res[0].replace(',','')
}
function getPayDetail(text, payment){
  return text.match(ptrns[payment]['ptr'][0])
}

function getPayment(text){
  let payment
  if (text.includes('支払')){
    payment = '支払'
  }
  else if (text.includes('送金')){
    payment = '送金'
  }
  else if(text.includes('受け取り')){
    payment = '受取'
  }else{
    throw 'Unmached payType'
  }
  return payment
}