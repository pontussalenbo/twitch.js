// API URI
const URI = 'https://api.twitch.tv/kraken/streams';
// API-key for Authentication
const API_KEY = '';
/** channels array where we store our streamers that will be fetched
 * they are fetched in the order you place them, first stream that is
 * online will be played. Put in qoutes '' and comma-separate.
 */
const channels = ['hiimmela', 'cohhcarnage', 'followgrubby', 'admiralbulldog', 'tfue', 'bikeman', 'playhearthstone', 'thijs'];
const onlineStream = [];
let j = 0;
// for exiting player, to select another stream that is online
// const keySequence = ['b', 'a'];
// const userInput = new Array(keySequence.length);

function switchStream(player, _stream) {
    player.setChannel(_stream);
    console.log('changed stream');
}

function eListen(player) {
    console.log(this);
    window.addEventListener('keyup', e => {
        console.log('loaded');
        switch (e.keyCode) {
            case 37:
                j -= 1;
                switchStream(player, onlineStream[j]);
                console.log('left');
                break;
            case 38:
                break;
            case 39:
                j += 1;
                switchStream(player, onlineStream[j]);
                console.log('right');
                break;
            case 40:
                break;
            default:
                console.log(`faulty input ${e.keyCode}`);
                break;
        }
    });
}

// function for creating embedded twitch iframe player
function createPlayer(channel) {
    try {
        // player options
        const opt = {
            width: 1600,
            height: 900,
            channel: channel,
        };
        const v = 0.9;
        // prettier-ignore
        console.log(`creating player with stream: ${channel}`);
        // eslint-disable-next-line no-undef
        const player = new Twitch.Player('player', opt);
        // when player is playing the stream, apply settings
        console.log('successfully created player.');
        player.addEventListener('playing', () => {
            console.warn('Twitch.PLAYER -> e.playing');
            console.log('stream now playing, please wait while settings are being applied.');
            player.setVolume(v);
            const q = player.getQualities();
            // prettier-ignore
            console.log('please note that a resolution value of chunked equals source quality. Any other resolution responds with its res and fps.');
            console.log(`setting quality: ${q[1].group} & setting volume: ${v}`);
            player.setQuality(q[1].group);
            // $('iframe')[0].requestFullscreen();
            // call stream switcher to enable the event listener and pass player as arg
        });
        // check if stream goes offline. If so, refetch channel array
        player.addEventListener('ended' || 'offline', () => {
            console.error('Twitch.PLAYER: stream ended or went offline. -> e.ended || e.offline');
            console.log(`${player.getChannel()} has ended the stream. Script will now reload.`);
            window.location.reload(true);
            console.log('script reloading');
        });
        eListen(player);
    } catch (e) {
        console.error(e);
    }
}

// fetch  twitch api function
async function reqTwitchAPI(array) {
    const r = await fetch(`${URI}/${array}?client_id=${API_KEY}`);
    const d = await r.json();
    return d;
}

// function for checking stream status
async function getStreamStatus() {
    // const a = performance.now();
    for (let i = 0; i < channels.length; i += 1) {
        console.log(`started fetch ${channels[i]}`);
        const r = reqTwitchAPI(channels[i]).catch(e => console.error(e, channels[i]));
        console.log('fetched data', r);
        switch (true) {
            case r.stream == null:
                console.warn(`${channels[i]} is offline. next...`);
                break;
            // eslint-disable-next-line no-undef
            case r.stream !== null && $('div#player > iframe').length < 1:
                console.log(`${channels[i]} is live!`);
                onlineStream.push(channels[i]);
                createPlayer(channels[i]);
                break;
            case r.stream !== null && r.stream.stream_type === 'live':
                console.log(`${channels[i]} is live but player is busy...`);
                onlineStream.push(channels[i]);
                console.warn(`stream already playing. Skipping ${channels[i]}`);
                break;
            default:
                break;
        }
    }
    console.log(onlineStream);
    document.getElementById('online').innerText = onlineStream;
}

// event listener for DOM elements and external scripts
document.addEventListener('readystatechange', event => {
    // DOMs Loaded
    if (event.target.readyState === 'interactive') console.info('HTML DOM:s are now loaded');
    if (event.target.readyState === 'complete') {
        // Everything has loaded, including external css, js and img
        console.log('External resources as JS and CSS are now loaded.');
        getStreamStatus().catch(e => console.error(e, channels));
    } else console.warn('loading external resources...');
});
