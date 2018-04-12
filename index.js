const from = require('from2')
const srt2vtt = require('srt-to-vtt')
const concat = require('concat-stream')
const path = require('path')
const isoptions = require('is-options')
const leven = require('leven')

let archive

const getfilename = url => {
  const filename = path.basename(url)
  const extlen = filename.length

  return filename.slice(0, -extlen)
}

const isdaturl = url => {
  const protocol = new URL(url).protocol
  return protocol === 'dat:'
}

const getpathname = url => {
  return new URL(url).pathname
}

const getextname = filepath => {
  return path.extname(filepath).toLowerCase()
}

const issrt = extname => {
  return extname === '.srt'
}

const isvtt = extname => {
  return extname === '.vtt'
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

  archive = new DatArchive(url)
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

const addtrack = (el, label, data) => {
  const trackel = document.createElement('track')
  const blob = new Blob([ data ], { type: 'text/vtt' })
  const srturl = URL.createObjectURL(blob)
  trackel.setAttribute('kind', 'subtitles')
  trackel.setAttribute('label', label)
  trackel.setAttribute('src', srturl)
  el.appendChild(trackel)
}

const addSubtitleTracks = async (el, url) => {
  if (!isdaturl(url)) return

  const srtfilepaths = await getSubtitlefilepaths(url)

  for (let path of srtfilepaths) {
    let filecontent = await archive.readFile(path)
    let extname = getextname(path)
    if (issrt(extname)) {
      fromsrt(filecontent).pipe(srt2vtt()).pipe(concat(vtt => {
        addtrack(el, path, vtt.toString())
      }))
    } else {
      addtrack(el, path, filecontent)
    }
  }
}

const videoPlayer = async opts => {
  let url, classname
  if (isoptions(opts)) {
    url = opts.url
    classname = opts.classname
  }

  if (typeof opts === 'string') {
    url = opts
  }
  classname = classname || ''

  const el = document.createElement('video')
  if (opts.class) document.setAttribute('class', classname)
  el.setAttribute('src', url)

  setTimeout(async () => {
    await addSubtitleTracks(el, url)
  }, 0)

  return el
}

module.exports = videoPlayer
