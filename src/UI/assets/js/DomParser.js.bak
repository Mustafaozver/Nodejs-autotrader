var Attribute = function(name,value){
	this.Name = "" + name;
	this.value = value;
};

Attribute.prototype.set = function(value){
	this.value = value;
};

Attribute.prototype.get = function(){
	return this.value;
};

Attribute.prototype.toString = function(){
	return "" + this.Name.toLowerCase() + "=" + JSON.stringify(this.value) + ""; // attribute="param" ...
};

var Node = function(name){
	this.Name = "" + name;
	this.Contents = [];
	this.Attributes = {};
};

Node.TAGSTART = "<"; // html and xml => <tagname attribute1="param">content</tagname>
Node.TAGEND = ">";
Node.TAGFINISHSIGN = "/";
Node.TAGSEPERATOR = " ";

Node.prototype.toString = function(){
	var i;
	var text = "" + Node.TAGSTART + this.Name.toUpperCase(); // <tagname
	for (var key in this.Attributes) text += Node.TAGSEPERATOR + this.Attributes[key].toString(); // _attribute="" ...
	if (Array.isArray(this.Contents)){
		text += Node.TAGEND; // ...>
		for (i=0;i<this.Contents.length;i++) text += this.Contents[i].toString(); // >...contents...<
		return text + Node.TAGSTART + Node.TAGFINISHSIGN + this.Name.toUpperCase() + Node.TAGEND; // ...</tagname>
	} else return text + Node.TAGSEPERATOR + Node.TAGFINISHSIGN + Node.TAGEND;
};

Node.prototype.setAttribute = function(param,value){
	if (!this.Attributes[param]) this.Attributes[param] = new Attribute(param,value);
	else this.Attributes[param].set(value);
};

Node.prototype.getAttribute = function(param){
	if (this.Attributes[param]) return this.Attributes[param].get();
	return false;
};

Node.prototype.appendChild = function(node){
	this.Contents.push(node);
	return node;
};

Node.prototype.getChild = function(seperator){
	var attribute = "";
	attribute = seperator.charAt(0);
	var components = this.Contents;
	this.Contents.filter(function(item){
		switch (attribute) {
			case "#":
				if (seperator.substring(1) == item.getAttribute("id")) return true;
			break;
			case ".":
				if (item.getAttribute("class").indexOf(seperator.substring(1)) > -1) return true;
			break;
		}
	});
	return node;
};

////////////////////////////////////////////////////////////////////////////////////////////////////

var Text = function(text){
	this.text = "" + text;
};

Text.prototype.toString = function(){
	return this.text;
};

var Document = function(){
	this.Start = "<!DOCTYPE html>";
	this.End = "\n";
	this.HTML = new HTMLObject();
};

Document.prototype.appendChild = Node.prototype.appendChild;
Document.prototype.toString = function(){
	return this.Start + this.HTML.toString() + this.End;
};

// HTML Object

var HTMLObject = function(){
	this.Object = new Node("HTML");
	this.HEAD = this.Object.appendChild(new HeadObject());
	this.BODY = this.Object.appendChild(new BodyObject());
};

HTMLObject.prototype.toString = function(){
	return this.Object.toString();
};

HTMLObject.prototype.setAttribute = function(param,value){
	this.Object.setAttribute(param,value);
};

HTMLObject.prototype.getAttribute = function(param){
	return this.Object.getAttribute(param);
};

HTMLObject.prototype.appendChild = function(node){
	return this.Object.appendChild(node);
};

HTMLObject.prototype.getChild = function(seperator){
	return this.Object.getChild(seperator);
};

// Head Object

var HeadObject = function(){
	this.Object = new Node("HEAD");
	this.CHARSET = this.Object.appendChild(new MetaObject());
	this.CHARSET.setAttribute("charset","utf-8");
	this.VIEWPORT = this.Object.appendChild(new MetaObject());
	this.VIEWPORT.setAttribute("viewport","width=device-width, initial-scale=1");
};

HeadObject.prototype.toString = function(){
	return this.Object.toString();
};

HeadObject.prototype.setAttribute = function(param,value){
	this.Object.setAttribute(param,value);
};

HeadObject.prototype.getAttribute = function(param){
	return this.Object.getAttribute(param);
};

HeadObject.prototype.appendChild = function(node){
	return this.Object.appendChild(node);
};

HeadObject.prototype.getChild = function(seperator){
	return this.Object.getChild(seperator);
};

// Meta Object

var MetaObject = function(){
	this.Object = new Node("META");
	this.Object.Contents = false;
};

MetaObject.prototype.toString = function(){
	return this.Object.toString();
};

MetaObject.prototype.setAttribute = function(param,value){
	this.Object.setAttribute(param,value);
};

MetaObject.prototype.getAttribute = function(param){
	return this.Object.getAttribute(param);
};

// Body Object

var BodyObject = function(){
	this.Object = new Node("BODY");
};

BodyObject.prototype.toString = function(){
	return this.Object.toString();
};

BodyObject.prototype.setAttribute = function(param,value){
	this.Object.setAttribute(param,value);
};

BodyObject.prototype.getAttribute = function(param){
	return this.Object.getAttribute(param);
};

BodyObject.prototype.appendChild = function(node){
	return this.Object.appendChild(node);
};

BodyObject.prototype.getChild = function(seperator){
	return this.Object.getChild(seperator);
};