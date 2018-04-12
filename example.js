const player  =  require('./')
var url = 'dat://1047fec2e6c4bc9756811a768396912ce89af5f691b7f40e991440bbabad3d10/Rick.and.Morty.S03E06.HDTV.x264-BATV.mkv'
player(url).then(el => {
  el.setAttribute('controls', true)
  el.setAttribute('autoplay', true)
  el.setAttribute('height', 400)
  el.setAttribute('width', 400)
  document.body.appendChild(el)
})

