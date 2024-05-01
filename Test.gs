function test_myFunction() {
    
  //###########################
  const sheetName = 'test'
  const targetFolderName = 'sample'
  const folderId = folderIds[targetFolderName]
  const tmpFolderId = folderIds['tmp']
  //##########################
  const sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName)

  const folder = DriveApp.getFolderById(folderId);
  const tmpFolder = DriveApp.getFolderById(tmpFolderId);

  const process_start_time = new Date()
  const timestamp = generateTimeStamp(process_start_time)

  const files = folder.getFiles();
  while(files.hasNext()){

    let file = files.next();
    let mimeType = file.getMimeType() // MimeTypeを取得
    let trimedImg
    //画像だった場合
    if(mimeType === 'image/png'){

      try{
        let imageBlob = file.getBlob()
        const imgSize = ImgApp.getSize(imageBlob)
        console.log(imgSize)

        let trimingRangePayInfo
        let trimingRangePayValue
        if(imgSize.height > 2000){
          trimingRangePayInfo = {t:400, b:1300, l:0, r:0}
          trimingRangePayValue = {t:670, b:1300, l:0, r:0}
        }else if(imgSize.height > 1000){
          trimingRangePayInfo = {t:250, b:450, l:0, r:0}
          trimingRangePayValue = {t:510, b:600, l:0, r:0}
        }else{
          throw new Error("")
        }

        //トリミングを実施、保存する
        trimedDataArray = new Array()
        // payInfo : 支払い先、時刻、金額が入ったデータ
        trimedDataArray['payInfo'] = {
          'img': generateTrimedImg(tmpFolder, imageBlob,trimingRangePayInfo),
          'ocrText': ''
          }
        // payValue : 金額のみ -> 画像により位置が変わるので一時使用中止
        trimedDataArray['payValue'] = {
          'img': generateTrimedImg(tmpFolder, imageBlob,trimingRangePayValue),
          'ocrText': ''
          }
      }catch(e){
        console.log(e)
        console
      }

      // OCRからデータ取得
      // ocrでテキストを取得(改行等は削除されている)
      // 引数: imgFileId
      trimedDataArray['payInfo'].ocrText = getOCRData(trimedDataArray['payInfo'].img.getId())
      trimedDataArray['payValue'].ocrText = getOCRData(trimedDataArray['payValue'].img.getId())


      let dateInfo, value, payment, detail, type
      try{
        const payInfoText = trimedDataArray.payInfo.ocrText
        const payValueText = trimedDataArray.payValue.ocrText

        // OCRのテキストデータ(改行等削除済み)から支払, 送金、受取を取得
        console.log("Get payment")
        payment = getPayment(payInfoText)
        console.log(payment)

        //支払い先を取得
        console.log("Get datail")
        detail = getPayDetail(payInfoText, payment)
        console.log(detail)

        //出金・入金を取得
        console.log("Get type")
        type = ptrns[payment]['type']
        console.log(type)

        // OCRのテキストデータ(改行等削除済み)から日付データを取得する
        console.log("Get date")
        dateInfo = getDate(payInfoText)
        console.log(dateInfo)
        
        //OCRのテキストデータ(改行等削除済み)から金額を取得する
        console.log("Get value")
        value = getMoneyValue(payValueText.replace(dateInfo.matchStr, ""))
        console.log(value)
      }catch(e){
        console.log(e)
        continue
      }finally{
        // トリミング画像を削除
        Drive.Files.remove(trimedDataArray['payInfo'].img.getId())
        Drive.Files.remove(trimedDataArray['payValue'].img.getId())
      }
      console.log(detail[0], type, value, dateInfo.timestamp)

      // // シートへ書き込み
      // タイムスタンプ, date, value, type, detail, category, sate,
      const result = [timestamp, dateInfo.timestamp, value, type, detail[0], 'paypay', false]
      sheet.appendRow(result)

      //　元画像をアーカイブ
      if (targetFolderName === 'paypay'){
        const archivesfolder = DriveApp.getFolderById(folderIds['archives'])
        file.moveTo(archivesfolder)
      }
    }
    else if(mimeType === 'text/plain'){
      //削除する
      file.setTrashed(true)
    }
  }
}