module.exports = {
  renderTemplate: function(template) {
    let div = document.createElement('div')
    div.innerHTML = template.trim()
    return div.childNodes[0]
  }
}
