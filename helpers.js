const path = require('path')

const isurl = path => {
  try {
    new URL(path)
    return true
  } catch(_) {
    return false
  }
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

const ism3u = extname => {
  return extname === '.m3u'
}

const ism3uurl = url => {
  const extname = getextname(url)
  return ism3u(extname)
}

const getfilenameWithext = url => {
  return path.basename(url)
}

const getfilename = url => {
  const filename = getfilenameWithext(url)
  const extlen = filename.length

  return filename.slice(0, -extlen)
}

const getplaylist = content => {
  return content
    .replace(/^.*#.*$|#EXTM3U|#EXTINF:/mg, '')
    .split('\n')
    .filter(x => x.trim() !== '')
}

module.exports = {
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
}
