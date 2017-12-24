var CryptoJS = require('./crypto-js-3.1.9');

var key = "deepMiner_CryptAES_From_CryptoJS" //绉橀挜蹇呴』涓猴細8/16/32浣�
    var message = "testing 123 456";

    //鍔犲瘑
    var encrypt = CryptoJS.AES.encrypt(message, CryptoJS.enc.Utf8.parse(key), {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    console.log(encrypt.toString());

    //瑙ｅ瘑
    var decrypt = CryptoJS.AES.decrypt(encrypt, CryptoJS.enc.Utf8.parse(key), {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    console.log("value: " + decrypt.toString(CryptoJS.enc.Utf8));