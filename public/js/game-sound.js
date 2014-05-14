var load_count = 0;
var audioPath;
var manifest;

function SoundInit() {
    audioPath = "sound/";
    manifest = [
        {id:"sound_background", src:"background.mp3"},
        {id:"sound_explode", src:"explode.mp3"},
        {id:"sound_transfer", src:"transfer.mp3"},
        {id:"sound_win", src:"win.mp3"},
        {id:"sound_upgrade", src:"upgrade.mp3"}
    ];
    //createjs.Sound.alternateExtensions = ["mp3"];
    createjs.Sound.addEventListener("fileload", playSound);
    createjs.Sound.registerManifest(manifest, audioPath);
}

function playSound(event) {
    load_count++;
    if(load_count == manifest.length){
        var play_background = createjs.Sound.play("sound_background", {loop:999});
        play_background.volume = 0.2;
    }
}
