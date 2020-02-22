const APIKEY = ''; // API KEY
const onlineStreams = [];
// Select quality (1080 / 720 / auto);
const quality = 1080;
// Channels to watch
const channels = ['esamarathon2', 'esamarathon', 'beyondthesummit', 'hiimmela', 'cohhcarnage', 'followgrubby', 'admiralbulldog', 'tfue', 'bikeman', 'playhearthstone', 'thijs'];
class Player {
    constructor(v = 0) {
        this.v = v;
        this.opt = { width: 1600, height: 900 };
        this.player = new Twitch.Player('player', this.opt);
    }

    /**
     *
     * @param {string} channel the streamer our player is bound to broadcast.
     * @param {any} quality the quality that is requested to be set to our player. Three choices, 720, 1080, auto. If an invalid choice is set, fallback is auto.
     */
    async createPlayer(channel, quality) {
        this.player.setChannel(channel);

        /* eventListener to detect if player is broadcasting stream, built-in in the Twitch Player API. */
        this.player.addEventListener('playing', async () => {
            console.warn('Twitch.PLAYER -> e.playing');
            console.log('stream now playing, please wait while settings are being applied.');
            switch (quality) {
                case 720:
                    console.log(`setting ${quality}p quality`);
                    this.player.setQuality('720p60');
                    break;
                case 1080:
                    console.log(`setting ${quality}p quality`);
                    this.player.setQuality('chunked');
                    break;
                default:
                    console.log('error setting requested quality. Quality will be set to auto.');
                    this.player.setQuality('auto');
                    break;
            }
        });

        // eventListener to check if stream goes offline. If so, refetch channel array.
        this.player.addEventListener('ended' || 'offline', () => {
            console.error('Twitch.PLAYER: stream ended or went offline. -> e.ended || e.offline');
            window.location.reload(true);
            console.log('script reloading');
        });
    }

    /**
     * function bound to switch stream and to toggle fullscreen as bonus feature.
     * 37 = left-arrow, 38 = arrow-up, 39 = right-arrow, 40 = arrow-down
     */
    switchStream() {
        let j = 0;
        window.addEventListener('keyup', e => {
            console.log('loaded');
            switch (e.keyCode) {
                case 37:
                    j -= 1;
                    this.player.setChannel(onlineStreams[j]);
                    console.log('changed stream');
                    break;
                case 38:
                    this.toggleFullscreen();
                    console.log('toggled fullscreen');
                    break;
                case 39:
                    j += 1;
                    this.player.setChannel(onlineStreams[j]);
                    console.log('changed stream');
                    break;
                default:
                    console.error('error');
                    break;
            }
        });
    }

    /**
     * function for toggling fullscreen. Is called from pressing arrowUp key.
     * uses browsers built-in fullScreen API.
     */
    toggleFullscreen() {
        const elem = document.getElementsByTagName('iframe')[0];
        if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            } else if (elem.mozRequestFullScreen) {
                elem.mozRequestFullScreen();
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
}

class Stream {
    static uri = 'https://api.twitch.tv/helix/streams?user_login'; // API URI

    /**
     *
     * @param {*} channel Streamers' username that we are fetching data of, from twitch API.
     */
    async reqAPI(channel) {
        const opts = { headers: { 'client-ID': APIKEY } };
        const r = await fetch(`${Stream.uri}=${channel}`, opts);
        const d = await r.json();
        return d;
    }

    /**
     *
     * @param {*} stream userdata we are to control, in order to detect stream-status.
     * @param {*} channel username of streamer.
     */
    async status(stream, channel) {
        // console.log(this.user);
        if (stream.data.length === 0) {
            console.log(`${channel} is offline.`);
        } else {
            console.log(`${channel} is online!`);
            onlineStreams.push(`${channel}`);
            const online = document.getElementById('online');
            // eslint-disable-next-line no-unused-expressions
            online.textContent === '' ? (online.textContent += `${channel}`) : (online.textContent += `, ${channel}`);
        }
    }
}

/**
 * Our main function which starts our stream checker script.
 * It executes when the eventListener has a readyState of complete, i.e. when all DOM's and scripts are loaded.
 */
async function Main() {
    const stream = new Stream();
    const player = new Player();

    const online = channels.map(async channel => {
        const res = await stream.reqAPI(channel);
        stream.status(res, channel);
    });

    await Promise.all(online).then(() => {
        player.createPlayer(onlineStreams[0], quality);
        player.switchStream();
    });
}
// event listener for DOM elements and external scripts
document.addEventListener('readystatechange', async event => {
    // DOMs Loaded
    if (event.target.readyState === 'interactive') console.info('HTML DOM:s are now loaded');
    if (event.target.readyState === 'complete') {
        // Everything has loaded, including external css, js and img
        console.log('External resources as JS and CSS are now loaded. Will now begin to fetch stream statuses.');
        Main().catch(e => console.error(e));
    } else console.warn('loading external resources...');
});
