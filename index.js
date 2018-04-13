const from = require('from2')
const srt2vtt = require('srt-to-vtt')
const concat = require('concat-stream')
const path = require('path')
const isoptions = require('is-options')
const leven = require('leven')

const {
  isurl,
  isdaturl,
  getpathname,
  getextname,
  issrt,
  isvtt,
  ism3u,
  ism3uurl,
  getfilenameWithext,
  getfilename,
  getplaylist,
} = require('./helpers')

const noop = () => {}

let next = noop
let prev = noop
let sourceurl
let el
let playlist = []
let currentindex = 0
let archive
let ret = {
  el,
  next,
  prev
}

const getPotentialSubtitleMatches = (filename, allfiles) => {
  return allfiles.filter(filepath => {
    const extname = path.extname(filepath).toLowerCase()
    return issrt(extname) || isvtt(extname)
  }).filter(filepath => {
    const name = getfilename(filepath)
    return leven(name, filename) <= 3
  })
}

const getSubtitlefilepaths = async url => {
  const filename = getfilename(url)
  const allfiles = await archive.readdir('/', {recursive: true})

  return getPotentialSubtitleMatches(filename, allfiles)
}

function fromsrt(string) {
  return from(function(size, next) {
    if (string.length <= 0) return next(null, null)

    var chunk = string.slice(0, size)
    string = string.slice(size)

    next(null, chunk)
  })
}

const addtrack = (label, data) => {
  const trackel = document.createElement('track')
  const blob = new Blob([ data ], { type: 'text/vtt' })
  const srturl = URL.createObjectURL(blob)
  trackel.setAttribute('kind', 'subtitles')
  trackel.setAttribute('label', label)
  trackel.setAttribute('src', srturl)
  el.appendChild(trackel)
}

const addSubtitleTracks = async (url) => {
  const srtfilepaths = await getSubtitlefilepaths(url)

  for (let path of srtfilepaths) {
    let filecontent = await archive.readFile(path)
    let extname = getextname(path)
    if (issrt(extname)) {
      fromsrt(filecontent).pipe(srt2vtt()).pipe(concat(vtt => {
        addtrack(path, vtt.toString())
      }))
    } else {
      addtrack(path, filecontent)
    }
  }
}

const setuparchive = url => {
  archive = new DatArchive(url)
}

const clearVideo = () => {
  const { el } = ret
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

const streamPlaylist = async () => {
  if (currentindex + 1 > playlist.length)
    return

  const url = playlist[currentindex]

  const videourl = (isurl(url) && !(isdaturl(url))) ?
    url : `${archive.url}/${url}`

  el.setAttribute('src', videourl)


  clearVideo()
  if (archive) {
    await addSubtitleTracks(url)
  }

  ret.next = () => {
    ++currentindex
    streamPlaylist()
  }

  ret.prev = () => {
    --currentindex
    streamPlaylist()
  }
}

const initialize = async () => {
  if (!isdaturl(sourceurl)) {
    el.setAttribute('src', sourceurl)
    return
  }

  setuparchive(sourceurl)

  if (ism3uurl(sourceurl)) {
    const filename = getfilenameWithext(sourceurl)
    const filecontent = await archive.readFile(filename)
    playlist = getplaylist(filecontent)
    await streamPlaylist()
    return
  }

  el.setAttribute('src', sourceurl)
  await addSubtitleTracks(sourceurl)
}

const videoPlayer = opts => {
  let classname = ''
  if (isoptions(opts)) {
    sourceurl = opts.sourceurl || ''
    classname = opts.classname || ''
  }

  if (typeof opts === 'string') {
    sourceurl = opts
  }

  el = document.createElement('video')
  if (opts.class) document.setAttribute('class', classname)

  setTimeout(async () => {
    await initialize()
  }, 0)

  return Object.assign(ret, {
    el
  })
}

module.exports = videoPlayer
