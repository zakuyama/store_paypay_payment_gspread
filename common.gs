// Folder ID
const folderIds = {
  "paypay": "", // Input root folder id
  "archives" : "", // Input archives folder id
  "sample" : "", 
  "tmp": "" // Input temporary folder id
}

const sheetId = "" // Input Spread sheet id

const ptrns = {
          支払: {"ptr":["^.+?支払","^.+?支払い" ], "type": "出金"},
          送金: {"ptr" : ["^.+?送金"], "type": "出金"},
          受取: {"ptr" : ["^.+?受け取り"], "type": "入金"}
        }

const resource = {
  title: "payparocr"
}
const option = {
  "ocr": true,
  "ocrLanguage": "ja"
}