const player  =  require('../')
const url = 'dat://1047fec2e6c4bc9756811a768396912ce89af5f691b7f40e991440bbabad3d10/playlist.m3u'
const o = player(url)

const { el, prev, next } = o
el.setAttribute('controls', true)
el.setAttribute('autoplay', true)
el.setAttribute('height', 400)
el.setAttribute('width', 400)
document.body.appendChild(el)

document.getElementById('next').addEventListener('click', () => {
  next()
})

document.getElementById('prev').addEventListener('click', () => {
  prev()
})
