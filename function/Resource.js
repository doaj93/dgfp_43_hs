var Resource = {
	createNew : function(_url, _content) {
		var resource = {};
		resource.url = _url;
		if (typeof (_url) === "undefined" || _url.split("/").length < 4) {
			resource.id = -1;
			resource.userid = "";
			resource.project = "";
			resource.name = "";
		} else {
			resource.userid = _url.split("/")[0];
			resource.id = _url.split("/")[3];
			resource.project = _url.split("/")[1];
			resource.name = _url.split("/")[2];
		}
		if (typeof (_content) === "undefined") {
			resource.content = "";
		} else {
			resource.content = _content;
		}
		resource.operation = ""; // operation分为add,remove,set三种，默认为add
		resource.attributes = new Array();
		resource.subresources = new Array();
		resource.log = null;
		resource.isGot = false;
		resource.msg = "";
		resource.requestURL_prefix = "http://202.120.40.175:40011/Entity/";
		resource.requestURL = "";
		resource.setURL = function(_url) {
			if (typeof (_url) === "undefined" || _url.split("/").length < 4) {
				resource.id = -1;
				resource.userid = "";
				resource.project = "";
				resource.name = "";
			} else {
				resource.userid = _url.split("/")[0];
				resource.id = _url.split("/")[3];
				resource.project = _url.split("/")[1];
				resource.name = _url.split("/")[2];
			}
		};
		resource.getURL = function() {
			return resource.url;
		};
		resource.getId = function() {
			return resource.id;
		};
		resource.setId = function(_id) {
			resource.id = _id;
			resource.url = resource.userid + "/" + resource.project + "/" + resource.name + "/" + resource.id;
		};
		resource.setRequestURLPrefix = function(_prefix) {
			resource.requestURL_prefix = _prefix;
		};
		resource.setOperation = function(op) {
			resource.operation = op;
		};
		resource.createPUT = function(_xml, _res, _parent) {
			for (var i = 0; i < _res.attributes.length; i++) {
				var param = _res.attributes[i];
				if (param.modified) {
					_xml += "\t<Operation-set>\n" + "\t\t<Target>" + _parent + param.name + "</Target>\n" + "\t\t<Value>" + param.value + "</Value>\n" + "\t</Operation-set>\n";
				}
			}
			for (var i = 0; i < _res.subresources.length; i++) {
				var subres = _res.subresources[i];
				_xml += "\t<Operation-" + subres.operation + ">\n" + "\t\t<Target>" + _parent + subres.name + "</Target>\n" + "\t\t<Value>" + subres.url + "</Value>\n" + "\t</Operation-" + subres.operation + ">\n";
				_xml = subres.createPUT(_xml, subres, _parent + subres.name + "[" + subres.id + "].");
			}
			return _xml;
		};

		resource.addAttribute = function(_param) {
			if (resource.isGot) {
				return "<error>GET之后不能添加属性</error>";
			} else {
				resource.attributes.push(_param);
			}
		};

		resource.getAttribute = function(_name) {
			var result;
			if (typeof (resource.content) === "object") {
				$(resource.content).children().each(function() {
					var nodename = $(this).context.nodeName;
					if (nodename === _name) {
						result = $(this).text();
					}
				});
			} else {
				for (var i = 0; i < resource.attributes.length; i++) {
					if (resource.attributes[i].name === _name)
						result = resource.attributes[i].value;
				}
			}
			return result;
		};

		resource.listAttributes = function() {
			if (resource.attributes.length === 0 && typeof (resource.content) === "object") {
				$(resource.content).children().each(function() {
					if ($(this).children().text() === "") {
						resource.attributes.push(Attribute.createNew($(this).context.nodeName, $(this).text(), false));
					}
				});
			}
			return resource.attributes;
		};

		resource.setAttribute = function(_name, _value) {
			var that = resource;
			var goon = true;
			if (typeof (resource.content) === "object") {
				$(resource.content).children().each(function() {
					if ($(this).context.nodeName === _name) {
						$(this).text(_value);
						for (var i = 0; i < that.attributes.length; i++) {
							if (that.attributes[i].name === _name) {
								that.attributes[i].value = _value;
								that.attributes[i].modified = true;
								goon = false;
							}
						}
						if (goon) {
							that.attributes.push(Attribute.createNew($(this).context.nodeName, $(this).text(), true));
							goon = false;
						}
					}
				});
			} else {
				for (var i = 0; i < resource.attributes.length; i++) {
					if (resource.attributes[i].name === _name) {
						resource.attributes[i].value = _value;
						resource.attributes[i].modified = true;
						goon = false;
					}
				}
			}
			if (goon) {
				resource.attributes.push(Attribute.createNew(_name, _value, true));
			}
		};

		resource.hasSubresource = function() {
			if (resource.subresources.length !== 0)
				return true;
			else
				return false;
		};

		resource.subresourceImpl = function(_res, op) {
			var goon = true;
			var result = "";
			if (resource.project === "") {
				result = "<error>父资源的项目不能为空</error>";
				goon = false;
			}
			_res.project = resource.project;
			if (_res.project !== "" && _res.project !== resource.project) {
				result = "<error>子资源应与父资源属于同一个项目且项目不能为空</error>";
				goon = false;
			}
			if (_res.name === "" || _res.id === -1) {
				result = "<error>添加子资源时资源名及资源id不能为空</error>";
				goon = false;
			}
			if (goon) {
				_res.operation = op;
				var exist = false;
				for (var i = 0; i < resource.subresources.length; i++) {
					var subres = resource.subresources[i];
					if (subres.name === _res.name && subres.id === _res.id) {
						exist = true;
						result = "子资源已存在";
						subres.operation = op;
						break;
					}
				}
				if (!exist) {
					resource.subresources.push(_res);
				}
			}
			return result;
		};

		resource.addSubresource = function(_res) {
			return resource.subresourceImpl(_res, "add");
		};

		resource.setSubresource = function(_res) {
			return resource.subresourceImpl(_res, "set");
		};

		resource.removeSubresource = function(_res) {
			return resource.subresourceImpl(_res, "remove");
		};

		resource.removeSubresourceByIndex = function(_index) {
			return resource.removeSubresource(resource.listSubresources()[_index]);
		};

		resource.removeSingularSubresource = function(_name) {
			if (typeof (resource.content) === "string") {
				for (var i = 0; i < resource.subresources.length; i++) {
					if (resource.subresources[i].name === _name && resource.subresources[i].id === _id) {
						resource.subresources[i].setId("null");
					}
				}
			} else if (typeof (resource.content) === "object") {
				var ss = resource.listSubresources(_name);
				for (var i = 0; i < ss.length; i++) {
					if (ss[i].name === _name) {
					}
					ss[i].setId("null");
				}
			}
		};

		resource.getSubresource = function(_name, _id) {
			var result = null;
			if (typeof (resource.content) === "string") {
				for (var i = 0; i < resource.subresources.length; i++) {
					if (resource.subresources[i].name === _name && resource.subresources[i].id === _id) {
						result = resource.subresources[i];
					}
				}
			} else {
				if (typeof (resource.content) === "object") {
					$(resource.content).children().each(function() {
						if ($(this).children().text() !== "") {
							var subresource;
							var that = this;
							$(this).children().each(function() {
								var newurl = $(this).text().split("/")[1];
								newurl = newurl.split("_")[0] + "/" + newurl.split("_")[1] + "/" + newurl.split("_")[2] + "/" + $(this).text().split("/")[2];
								console.log(newurl);
								if ($(this).context.nodeName === "uri" && newurl === resource.project + "/" + _name + "/" + _id) {
									subresource = Resource.createNew($(this).text(), that);
									resource.addSubresource(subresource, "set");
									result = subresource;
								}
							});
						}
					});
				}
			}
			return result;
		};

		resource.listSpecificSubresources = function(_name) {
			var result = new Array();
			for (var i = 0; i < resource.subresources.length; i++) {
				if (resource.subresources[i].name === _name) {
					result.push(resource.subresources[i]);
				}
			}
			$(resource.content).children().each(function() {
				if ($(this).children().text() !== "" && $(this).context.nodeName === _name) {
					var subresource;
					var that = this;
					$(this).children().each(function() {
						if ($(this).context.nodeName === "uri") {
							var exist = false;
							var newurl = $(this).text().split("/")[1];
							newurl = newurl.split("_")[0] + "/" + newurl.split("_")[1] + "/" + newurl.split("_")[2] + "/" + $(this).text().split("/")[2];
							console.log(newurl);
							for (var i = 0; i < resource.subresources.length; i++) {
								if (newurl === resource.subresources.url) {
									exist = true;
									break;
								}
							}
							if (!exist) {
								subresource = Resource.createNew(newurl, that);
								result.push(subresource);
								resource.addSubresource(subresource, "set");
							}
						}
					});
				}
			});
			return result;
		};

		resource.listSubresources = function() {
			console.log(resource.content)
			var result = new Array();
			$(resource.content).children().each(function() {
				if ($(this).children().text() !== "") {
					var subresource;
					var that = this;
					$(this).children().each(function() {
						if ($(this).context.nodeName === "uri") {
							var exist = false;
							var newurl = $(this).text().split("/")[1];
							newurl = newurl.split("_")[0] + "/" + newurl.split("_")[1] + "/" + newurl.split("_")[2] + "/" + $(this).text().split("/")[2];
							console.log(newurl);
							for (var i = 0; i < resource.subresources.length; i++) {
								if (newurl === resource.subresources.url) {
									exist = true;
									break;
								}
							}
							if (!exist) {
								subresource = Resource.createNew(newurl, that);
								result.push(subresource);
								resource.addSubresource(subresource, "set");
							}
						}
					});
				}
			});
			return result;
		};

		resource.createURL = function() {
			if (resource.id === -1) {
				return "<error>资源uri不能为空</error>";
			} else {
				resource.requestURL = resource.requestURL_prefix + resource.url;
			}
		};
		resource.GET = function() {
			var msg = resource.createURL();
			if (typeof (msg) !== "undefined") {
				resource.msg = msg;
			} else {
				$.ajax({
					type : "GET",
					async : false,
					url : resource.requestURL,
					contentType : "application/xml",
					datatype : "xml",
					beforeSend : function(request) {
						request.setRequestHeader("passwd", $.cookie('passwd'));
					},
					success : function(data) {
						console.log(data);
						if ($(data).find("error").text() !== "") {
							resource.msg = "<error>" + ($(data).text()) + "</error>";
						}
						resource.content = $(data).find(resource.userid + "_" + resource.project + "_" + resource.name);
						resource.msg = "<succeed></succeed>";
					},
					error : function(XMLHttpRequest, textStatus, errorThrown) {
						resource.msg = textStatus;
					}
				});
			}
		};
		resource.POST = function() {
			if (resource.name === "" || resource.project === "") {
				resource.msg = "<error>资源uri不能为空</error>";
			} else {
				resource.requestURL = resource.requestURL_prefix + resource.url;
				var xml = "<POST>\n";
				for (var i = 0; i < resource.attributes.length; i++) {
					var param = resource.attributes[i];
					xml += "\t<Operation-set>\n" + "\t\t<Target>this." + param.name + "</Target>\n" + "\t\t<Value>" + param.value + "</Value>\n" + "\t</Operation-set>\n";
				}
				for (var i = 0; i < resource.subresources.length; i++) {
					var subres = resource.subresources[i];
					var subresName = String(subres.name);
					subresName = subresName.substring(subres.name.indexOf(".") + 1);
					xml += "\t<Operation-" + subres.operation + ">\n" + "\t\t<Target>this." + subresName + "</Target>\n" + "\t\t<Value>" + subres.userid + "/" + subres.project + "/" + subresName + "/" + subres.id + "</Value>\n" + "\t</Operation-" + subres.operation + ">\n";
				}
				xml += "</POST>";
				console.log(xml);
				$.ajax({
					type : "POST",
					async : false,
					url : resource.requestURL.substring(0, resource.requestURL.lastIndexOf("/")),
					contentType : "application/xml",
					data : xml,
					beforeSend : function(request) {
						request.setRequestHeader("passwd", $.cookie('passwd'));
					},
					success : function(data) {
						resource.msg = "<succeed></succeed>";
						if ($(data).find("error").text() !== "") {
							resource.msg = "<error>" + ($(data).text()) + "</error>";
						} else {
							resource.id = $(data).find("Created").text().split("/")[$(data).find("Created").text().split("/").length - 1];
							resource.url = resource.userid + "/" + resource.project + "/" + resource.name + "/" + resource.id;
							resource.GET();
						}
					},
					error : function(XMLHttpRequest, textStatus, errorThrown) {
						resource.msg = textStatus;
					}
				});
			}
		};
		resource.PUT = function() {
			var msg = resource.createURL();
			if (typeof (msg) !== "undefined") {
				resource.msg = msg;
			} else {
				var xml = resource.createPUT("<PUT>\n", resource, "this.");
				xml += "</PUT>";
				console.log(xml);
				$.ajax({
					type : "PUT",
					async : false,
					url : resource.requestURL,
					contentType : "application/xml",
					data : xml,
					beforeSend : function(request) {
						request.setRequestHeader("passwd", $.cookie('passwd'));
					},
					success : function(data) {
						resource.msg = "<succeed></succeed>";
						if ($(data).find("error").text() !== "") {
							resource.msg = "<error>" + ($(data).text()) + "</error>";
						} else {
							resource.GET();
						}
					},
					error : function(XMLHttpRequest, textStatus, errorThrown) {
						resource.msg = textStatus;
					}
				});
			}
		};
		resource.DELETE = function() {
			var msg = resource.createURL();
			if (typeof (msg) !== "undefined") {
				resource.msg = msg;
			} else {
				$.ajax({
					type : "DELETE",
					async : false,
					url : resource.requestURL,
					datatype : "xml",
					beforeSend : function(request) {
						request.setRequestHeader("passwd", $.cookie('passwd'));
					},
					success : function(data) {
						resource.msg = "<succeed></succeed>";
						if ($(data).find("error").text() !== "") {
							resource.msg = "<error>" + ($(data).text()) + "</error>";
						}
					},
					error : function(XMLHttpRequest, textStatus, errorThrown) {
						resource.msg = textStatus;
					}
				});
			}
		};
		resource.getMsg = function() {
			return resource.msg;
		};
		return resource;
	}
};
