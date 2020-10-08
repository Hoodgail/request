class Worker {
  constructor() {
    const scope = this
    this.right = Dom.Get("right");
    this.left = Dom.Get("left");
    this.right_top = Dom.Get("right_top")
    this.right_bottom = Dom.Get("right_bottom")
    this.methods = ["GET", "POST", "PUT", "DELETE"]
    this.types = ["json", "text"]
    
    this.qs = {}
    
    this.colors = new Map()
    
    this.colors.set(this.methods[0], "gold")
    this.colors.set(this.methods[1], "purple")
    this.colors.set(this.methods[2], "skyblue")
    this.colors.set(this.methods[3], "lightred")
    
    this.right_bottom_map = new Map()
    this.right_bottom_map.set("Status", new Dom("<div></div>"))
    
    this.right_bottom_map.set("Pre", new Dom("<pre></pre>", {
      style:"height: 560px;overflow: auto;"
    }))
    
    this.right_top_map = new Map()
    this.right_top_map.set("Uri", new Dom("<input>", {
      placeholder:"https://example.com/api.json",
      value:"https://ip-api.com/json/"
    }))
    
    this.right_top_map.set("Method", new Dom("<select></select>", {}).add(...this.methods.map(function(method, id){
      return new Dom("<option></option>", {
        value:id,
        innerHTML:method
      })
    })))
    
    this.right_top_map.set("Type", new Dom("<select></select>", {}).add(...this.types.map(function(type, id){
      return new Dom("<option></option>", {
        value:id,
        innerHTML:type
      })
    })))
    
    this.right_top_map.set("Params", new Dom("<input>", {
      type:"button",
      value:"Params",
      onclick(){
        scope.object_element("qs")
      }
    }))
    this.right_top_map.set("Send", new Dom("<input>", {
      type:"button",
      value:"Send",
      style:"background:#3a96bc;border:solid skyblue 2px;box-shadow:0 0 11px 3px #87ceeb78;",
      onclick(){
        scope.send()
      }
    }))
    this.right_top_map.forEach((dom, name)=>{
      this.right_top.add(new Dom("<div></div>").add(dom))
    })
    this.right_bottom_map.forEach((dom, name)=>{
      this.right_bottom.add(new Dom("<div></div>").add(dom))
    })
  }
  log(block, message){
    let body = new Dom("<div></div>", { className: "log" })
    let block_el = new Dom("<div>{{block}}</div>", { block, className: "log_block" })
    let message_el = new Dom("<div>{{message}}</div>", { message, className: "log_message" })
    
    if(this.colors.has(block)) block_el.style = {background:this.colors.get(block)};
    this.left.add(body.add(block_el, message_el))
  }
  property(name, value, property){
    const scope = this
    const parent = new Dom("<div></div>")
    const add = (name, value) => [new Dom("<input>", {value:value}), new Dom("<span> = </span>"), new Dom("<input>", {value})];
    let els = add(name, value)
    parent.style = {
      display:"flex"
    }
    els[1].style = {
      height: "min-content",
      marginTop: "auto",
      marginBottom: "auto"
    }
    els[2].style = {
      width: "100px"
    }
    els[0].style = {
      width: "50px"
    }
    els[3] = new Dom("<button></button>", {
      innerHTML : "X",
      onclick(){
        delete scope[property][els[0].element.value];
        parent.element.remove()
      }
    })
    return parent.add(...els)
  }
  replacer(match, pIndent, pKey, pVal, pEnd) {
    var key = '<span class=json-key>';
    var val = '<span class=json-value>';
    var str = '<span class=json-string>';
    var r = pIndent || '';
    if (pKey)
      r = r + key + pKey.replace(/[": ]/g, '') + '</span>: ';
    if (pVal)
      r = r + (pVal[0] == '"' ? str : val) + pVal + '</span>';
    return r + (pEnd || '');
  }
  prettyPrint(obj) {
    var jsonLine = /^( *)("[\w]+": )?("[^"]*"|[\w.+-]*)?([,[{])?$/mg;
    return JSON.stringify(obj, null, 3)
      .replace(/&/g, '&amp;').replace(/\\"/g, '&quot;')
      .replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(jsonLine, this.replacer);
  }
  object_element(property){
    if(this.qs_on) return;
    this.qs_on = true
    const scope = this
    const background = new Dom("<div></div>", {className:"background"})
    const body = new Dom("<div></div>", {
      className : "params_element",
      style:"z-index:2"
    })
    body.inputs = () => new Map([...body.element.querySelectorAll("div")].map(r=>[...r.querySelectorAll("input")].map(r=>r.value)))
    const qs = Object.keys(this[property]).map((name)=>{
      return this.property(name, this[property][name], property)
    })
    let add = new Dom("<button>New<button>", {
      onclick(){
        body.add(scope.property("", "", property))
      }
    })
    let save = new Dom("<button>Save<button>", {
      onclick(){
        body.inputs().forEach(function(value, name){
          scope[property][name] = value
          console.log(scope[property])
        })
      }
    })
    let close = new Dom("<button>Close<button>", {
      onclick(){
        body.element.remove()
        background.element.remove()
        scope.qs_on = false
      }
    })
    body.add(add, save, close, ...qs)
    document.body.append(background.element, body.element)
  }
  query(params){
    if(!params) return params;
    return Object.keys(params).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`).join('&');
  }
  async send(){
    let uri = this.right_top_map.get("Uri").element.value
    let method = this.methods[this.right_top_map.get("Method").element.value]
    let type = this.types[this.right_top_map.get("Type").element.value]
    let query = this.qs
    
    const req = await this.request({ method, uri, query, type })
     
    this.right_bottom_map.get("Pre").html = ""
    if(type == "json"){
      this.right_bottom_map.get("Pre").element.append(new JSONFormatter(req[1]).render())
    }
    
    this.log(method, uri)
  }
  async request( { method = "GET", uri, body, query, type = "json" } ){
    console.log(arguments)
    if(!this.methods.includes(method)) throw new Error(`Method: "${method}" is not a valid method`);
    const request = await fetch(uri + "?" + this.query(query), {
      method,
    })
    const raw = await request.text()
    const response = type=="json"?JSON.parse(raw):raw
    return [request, response, raw]
  }
}
