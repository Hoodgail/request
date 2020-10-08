class Dom {
  constructor(html, contex = window, element = false) {
    this.contex = contex;
    this.variables = [];
    this.variable_regex = "{{([a-zA-z]+)}}"
    try {
      this.variables = html.match(new RegExp(this.variable_regex, "gm")).map(r => r.match(new RegExp(this.variable_regex))[1]);
    } catch (e) {}
    this.attr = Object.keys(contex).filter(name => !this.variables.includes(name)).map(r => ({ name: r, value: this.contex[r] }));
    if(!element)
      this.element = this.render(html.replace(new RegExp(this.variable_regex, "gm"), (...args) => contex[args[1]]));
    else
       this.element = element
    this.attr.forEach(res => {this.element[res.name] = res.value});
  }
  clear(){
    this.element.innerHTML = ""
  }
  render(html) {
    let element = document.createElement('div');
    element.innerHTML = html;
    return element.firstChild;
  }
  add(...els) {
    this.element.append(...[...els].map(r => r.element));
    return this
  }
  addTop(...els){
    this.element.prepend(...[...els].map(r => r.element));
    return this
  }
  hide(){
    this.element.style.display = "none"
  }
  scroll(){
    this.element.scrollTop = this.element.scrollHeight;
  }
  display(style = "block"){
    this.element.style.display = style
  }
  static Get(id, others = {}){
    return new Dom(null, {}, document.getElementById(id))
  }
  static link(href) {
    let link = new Dom("<link type'text/css' rel='stylesheet' href='{{href}}' />", { href });
    document.body.append(link.element);
    return link;
  }
  static Image(url, w, h) {
    return new Promise((resolve, reject) => {
      var image = new Image(w, h);
      image.src = url;
      image.onload = () =>
        resolve({
          element: image,
        });
      image.onerror = () => reject(new Error('could not load image'));
    });
  }
  set html(html) {
    this.element.innerHTML = html;
  }
  set style(res = {}) {
    Object.keys(res).forEach(name => (this.element.style[name] = res[name]));
  }
}

