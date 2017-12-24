eval("%CryptoJS_CODE%");
function enAES(key, str) {
    var encrypt = CryptoJS.AES.encrypt(str, CryptoJS.enc.Utf8.parse(key), {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypt;
}
function deAES(key, str) {
    var decrypt = CryptoJS.AES.decrypt(str, CryptoJS.enc.Utf8.parse(key), {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return decrypt;
}
eval(deAES("%AES_KEY%", "%AES_FILE%"));