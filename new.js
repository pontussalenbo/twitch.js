const uri = 'https://api.twitch.tv/helix/streams?user_login'; // API URI
const apikey = 'b'; // API KEY, GeT urZ oWn PleS eksDe
const onlineStream = []; // do nOt ToUCh plEs
const kvalitet = 'lulW'; // Här ställer du in kvalitet (1080 / 720 / auto);
const volym = 0; // Här ställer du in volym;
// Här lägger du in dina streams!
const channels = ['esamarathon2', 'esamarathon', 'beyondthesummit', 'dota2ti', 'hiimmela', 'cohhcarnage', 'followgrubby', 'admiralbulldog', 'tfue', 'bikeman', 'playhearthstone', 'thijs'];

function setStream(player, _stream) {
    player.setChannel(_stream);
    console.log('changed stream');
}

/**
 * function for toggling fullscreen. Is called from pressing arrowUp key.
 * uses browsers built-in fullScreen API.
 */
function toggleFullscreen() {
    // eslint-disable-next-line no-undef
    const elem = document.getElementsByTagName('iframe');
    // eslint-disable-next-line max-len
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

function switchStream(player) {
    let j = 0;
    window.addEventListener('keyup', e => {
        switch (e.keyCode) {
            case 37:
                j -= 1;
                setStream(player, onlineStream[j]);
                console.log('left');
                break;
            case 38:
                toggleFullscreen();
                break;
            case 39:
                j += 1;
                setStream(player, onlineStream[j]);
                console.log('right');
                break;
            case 40:
                break;
            default:
                console.log(`faulty input key: ${e.key}`);
                break;
        }
    });
}

function createPlayer(channel) {
    try {
        // player options
        const opt = {
            width: 1600,
            height: 900,
            channel: channel,
        };
        console.log(`creating player with stream: ${channel}`);
        const player = new Twitch.Player('player', opt);
        // when player is playing the stream, apply settings
        console.log('successfully created player.');
        player.addEventListener('playing', () => {
            console.warn('Twitch.PLAYER -> e.playing');
            console.log('stream now playing, please wait while settings are being applied.');
            player.setMuted(false);
            player.setVolume(volym);
            const q = player.getQualities();
            if (kvalitet === 1080) {
                player.setQuality(q[1].group);
                console.log(`setting quality: 1080 & setting volume: ${volym}`);
            } else if (kvalitet === 720) {
                player.setQuality(q[2].group);
                console.log(`setting quality: ${q[2].group} & setting volume: ${volym}`);
            } else {
                player.setQuality(q[0].group);
                console.log(`setting quality: ${q[0].group} & setting volume: ${volym}`);
            }
        });
        // check if stream goes offline. If so, refetch channel array
        player.addEventListener('ended' || 'offline', () => {
            console.error('Twitch.PLAYER: stream ended or went offline. -> e.ended || e.offline');
            console.log(`${player.getChannel()} has ended the stream. Script will now reload.`);
            window.location.reload(true);
            console.log('script reloading');
        });
        switchStream(player);
    } catch (e) {
        console.error(e);
    }
}

// fetch twitch api function
async function reqTwitchAPI(array) {
    const opts = {
        headers: {
            'client-ID': apikey,
        },
    };
    const r = await fetch(`${uri}=${array}`, opts);
    const d = await r.json();
    return d;
}

// function for checking stream status
async function getStreamStatus() {
    const online = document.getElementById('online');
    for (let i = 0; i < channels.length; i += 1) {
        console.log(`started fetch ${channels[i]}`);
        const r = await reqTwitchAPI(channels[i]).catch(e => console.error(e, channels[i]));
        console.log('fetched data', r);
        switch (true) {
            case r.data.length === 0:
                console.warn(`${channels[i]} is offline. next...`);
                break;
            case r.data.length > 0:
                onlineStream.push(`${channels[i]}`);
                online.textContent === '' ? (online.textContent += `${channels[i]}`) : (online.textContent += `, ${channels[i]}`);
                break;
            default:
                break;
        }
    }
    createPlayer(onlineStream[0]);
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
