const jsmediatags = window.jsmediatags;
let audios = [];
let id = 0;
const audioURLs = [
    "https://dl.dropboxusercontent.com/scl/fi/jocjyj17a1nww4yhbbi0r/A-Dramatic-Irony.mp3?rlkey=y1b341xz6n52zsust78fc5cke&st=pdvr3vkd&dl=0",
    "https://dl.dropboxusercontent.com/scl/fi/2ywvi1x3jbiaaexqen5bv/Lost-Umbrella.mp3?rlkey=cw090ge63t3vd0msr00pnyk6i&st=2uxbntjg&dl=0",
    "https://dl.dropboxusercontent.com/scl/fi/ehkiwv0889akzooonk5cl/Moonlight-Sonata.mp3?rlkey=j22frc8cz8j9h7y09l5fay9t3&st=aqmubuej&dl=0",
    "https://dl.dropboxusercontent.com/scl/fi/t9xabtzjr0lp3r76f2fob/Sea-Of-Problems.mp3?rlkey=buu0615mu9wixel37rxyp3447&st=hp9wobfu&dl=0",
    "https://dl.dropboxusercontent.com/scl/fi/k7adb8lxuvk5wdju4fi0i/Roi-Instrumental.mp3?rlkey=fcsqmj1xlt96co227cpfwty6q&st=72kwd2j6&dl=0",
    "https://dl.dropboxusercontent.com/scl/fi/ma1bueq2q04070q0hcsvm/Her-Eyes.mp3?rlkey=cmiu2hw7nsrtlo866n5ediavw&st=7qbn05dt&dl=0",
    "https://dl.dropboxusercontent.com/scl/fi/qbgmjv4fukbhvsgjulcwi/amour-plastique-slowed-reverb.mp3?rlkey=2ahejd44dzjb8cxr2pg1teaox&st=l79xk4pg&dl=0",
    "https://dl.dropboxusercontent.com/scl/fi/2elib6yctgzqfy5i64y81/Sea-Of-Problems-2.mp3?rlkey=x48f1e7baqvpk55l4ce85b8wz&st=w80ae5mq&dl=0",
    "https://dl.dropboxusercontent.com/scl/fi/2a5ix06i7lwr416x7paav/GYPSY-WOMAN-x-METAMORPHOSIS.mp3?rlkey=362vd9mvgpde77qhd4fp1fi5y&st=0g23teir&dl=0",
    "https://dl.dropboxusercontent.com/scl/fi/xj41nywccyyafc0oydhtl/Past.mp3?rlkey=ddgqq3h0ucv8rwozel5qvtkvc&st=xerupvxd&dl=0",
    "https://dl.dropboxusercontent.com/scl/fi/i7inr0kvaja8icmf8bbfc/September-Instrumental-Sped-Up.mp3?rlkey=zcp5hlidkk9cxohbzjcnzsfns&st=e1anb725&dl=0",
    "https://dl.dropboxusercontent.com/scl/fi/ydrs98dgabjhd5tr7lrld/Link-Start.mp3?rlkey=okx3300dkjt9mjnnald8f9p7p&st=xp2osrw8&dl=0"
];

// Function to process each audio
const processAudio = (song) => {
    return new Promise((resolve, reject) => {
        jsmediatags.read(song, {
            onSuccess: (tag) => {
                const tags = tag.tags;

                // Extracting the details
                const title = tags.TIT2 ? tags.TIT2.data : 'Unknown Title';
                const artist = tags.TPE1 ? tags.TPE1.data : 'Unknown Artist';
                const album = tags.TALB ? tags.TALB.data : 'Unknown Album';
                const year = tags.TYER ? tags.TYER.data : 'Unknown Year';
                const picture = tags.APIC ? tags.APIC.data : null;

                const audio = new Audio(song);
                audio.addEventListener('loadedmetadata', () => {
                    const duration = audio.duration;

                    audios.push({
                        id: id,
                        title: title,
                        artist: artist,
                        album: album,
                        duration: `${formatDuration(duration)}`,
                        src: song,
                        thumbnail: picture ? `data:image/jpeg;base64,${arrayBufferToBase64(picture.data)}` : null,
                    });
                    id += 1;
                    resolve();
                });
                audio.addEventListener('error', () => {
                    reject(new Error('Failed to load audio metadata'));
                });
            },
            onError: (error) => {
                reject(error);
            }
        });
    });
};

// Load all audio data
Promise.all(audioURLs.map(processAudio))
    .then(() => {
        console.log("All audio data loaded.");
        document.querySelector(".loader-body").style.display = "none";
        // console.log("Audios:", audios);

        let userData = {
            songs: [...audios],
            currentSong: null,
            duration: 0,
            songCurrentTime: null,
        };

        const playButton = document.querySelector(".play");
        const pauseButton = document.querySelector(".pause");

        const prevButton = document.querySelector(".prev");
        const nextButton = document.querySelector(".next");

        const title = document.querySelector(".song-title");
        const artist = document.querySelector(".song-artist");
        const thumbnail = document.querySelector("#thumbnail-img");

        const progressBar = document.querySelector("#progress-bar");
        const ongoingDuraton = document.querySelector(".ongoing-duration");
        const songDuraton = document.querySelector(".song-duration");

        const audio = new Audio();

        // - Functions - //
        // Play song
        const playSong = (id) => {
            id = Number(id);
            if (playButton.classList.contains("active")) {
                pauseButton.classList.add("active");
                playButton.classList.remove("active");
            }
            const song = audios.find((song) => song.id === id);
            if (song) {
                if (audio.src !== song.src) {
                    audio.src = song.src;
                    audio.load();
                }
                audio.play();
                console.log("Now playing:", song.title);
                userData.currentSong = id;
                userData.duration = song.duration;
                renderSong();
            } else {
                console.log(`Song with id ${id} not found`);
            }
        };

       const renderPlaylist = () => {
        userData.songs.forEach((audio) => {
            let id = audio.id + 1;
            let album = audio.album;
            let duration = audio.duration;
            let title = audio.title;
            let artist = audio.artist;

            let music = document.createElement("li");
                    music.classList.add(`song`);
                    music.classList.add(`song-${id}`);

                    let musicId = document.createElement("span");
                    musicId.classList.add("id");
                    music.appendChild(musicId)

                    let musicTitle = document.createElement("span");
                    musicTitle.classList.add("music-title");

                    let titleMusic = document.createElement("p")
                    titleMusic.classList.add("title")
                    
                    let artistMusic = document.createElement("p")
                    artistMusic.classList.add("artist")

                    music.appendChild(musicTitle)
                    musicTitle.appendChild(titleMusic)
                    musicTitle.appendChild(artistMusic)

                    let musicAlbum = document.createElement("span");
                    musicAlbum.classList.add("album")
                    let musicDuration = document.createElement("span");
                    musicDuration.classList.add("duration")


                    musicAlbum.innerHTML = album;
                    musicDuration.innerHTML = duration;
                    musicId.innerHTML = id;
                    titleMusic.innerHTML = title;
                    artistMusic.innerHTML = artist;


                    music.appendChild(musicAlbum)
                    music.appendChild(musicDuration)

                    document.querySelector("#songs").appendChild(music)
        })
       }
        const sortSongs = () => {
            userData.songs.sort((a, b) => a.title.localeCompare(b.title));        
            userData.songs.forEach((song, index) => {
                song.id = index;
            });
        }
        // Render the song info to the screen
        const renderSong = () => {
            sortSongs();
            if (!document.querySelector("li.song")) renderPlaylist();
            const currentSongId = userData.currentSong;
            const song = userData.songs.find((song) => song.id === currentSongId);
            document.querySelector("body").style.cssText = `background-image: url(${song?.thumbnail});`
            title.innerHTML = song?.title;
            artist.innerHTML = song?.artist;
            songDuraton.innerHTML = song?.duration;
            const currentDuration = userData?.songCurrentTime ? userData?.songCurrentTime : "0:00"; 
            ongoingDuraton.innerHTML = currentDuration;
            thumbnail.setAttribute("src", song?.thumbnail);
            const songs = document.getElementsByClassName("song");
            for (let i = 0; i < songs.length; i++) {
                songs[i].classList.remove("playing")
            }
            let currentSong = songs[userData.currentSong]
            currentSong.classList.add("playing");
            // console.log("User Data:", userData);
        }

        const playNextSong = () => {
            let currentSongId = userData.currentSong;
            if (currentSongId < userData.songs.length - 1) {
                currentSongId += 1;
            } else {
                currentSongId = 0;
            }
            userData.currentSong = currentSongId;
            playSong(currentSongId);

        }
        const playPreviousSong = () => {
            let currentSongId = userData.currentSong;
            if (currentSongId > 0) {
                currentSongId -= 1;
            } else {
                currentSongId = userData.songs.length-1;
            }
            const song = userData.songs.find((song) => song.id === currentSongId);
            userData.currentSong = currentSongId;
            userData.duration = song.duration;
            playSong(currentSongId);
        }
        userData.currentSong = 0;
        renderSong();

        // - Event listeners - //
        audio.addEventListener('timeupdate', () => {
            const progress = (audio.currentTime / audio.duration) * 100;
            userData.songCurrentTime = formatDuration(audio.currentTime);
            progressBar.style.setProperty('--progress-width', `${Math.floor(progress)}%`);
            progressBar.value = !isNaN(progress) ? Math.floor(progress) : 0;
            const currentTime = formatDuration(audio.currentTime);
            ongoingDuraton.innerHTML = currentTime;

            if (currentTime===userData.duration) {
                renderSong();
                playNextSong();
            }
        });
        progressBar.addEventListener('input', () => {
            const seekTime = (progressBar.value / 100) * audio.duration;
            audio.currentTime = seekTime;
        });

        //  Play and pause buttons
        playButton.classList.add("active")
        playButton.addEventListener("click", () => {
            if (playButton.classList.contains("active")) {
                playButton.classList.remove("active");
                pauseButton.classList.add("active");
                let currentSongId;
                if (userData.currentSong == null) {
                    currentSongId = 0;
                    userData.currentSong = 0;
                } else {
                    currentSongId = userData.currentSong;
                }
                playSong(currentSongId);
            }
        });
        pauseButton.addEventListener("click", () => {
            if (pauseButton.classList.contains("active")) {
                pauseButton.classList.remove("active");
                playButton.classList.add("active");

                audio.pause();
                console.log("Paused:", userData.currentSong);
            }
        });
        nextButton.addEventListener("click", playNextSong)
        prevButton.addEventListener("click", playPreviousSong);

        document.querySelectorAll(`.song`).forEach((e) => {
            let classname = e.className.split(' ')[1]
            const song = document.querySelector(`.${classname}`)
            const songId = classname.split("-")[1] - 1;
            song.addEventListener("click", () => {
                playSong(songId);
                document.querySelector(".album-page").classList.toggle("active")
            })
        })
    })
    .catch((error) => {
        console.error('Error loading audio data:', error);
    });

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function formatDuration(duration) {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

window.addEventListener("DOMContentLoaded", () => {
    const albumPage = document.querySelector(".album-page")
    const playlistIcon = document.getElementById("playlistIcon")

    playlistIcon.addEventListener("click", () => {
        albumPage.classList.toggle("active")
    })
})