var ResourceCollection = {
    createNew: function(_url) {
        var resourcecollection = {};
        resourcecollection.url = _url;
        if (typeof (_url) === "undefined" || _url.split("/").length < 3) {
            resourcecollection.userid = "";
            resourcecollection.project = "";
            resourcecollection.name = "";
        } else {
            resourcecollection.userid = _url.split("/")[0];
            resourcecollection.project = _url.split("/")[1];
            resourcecollection.name = _url.split("/")[2];
            resourcecollection.url = resourcecollection.userid + "/" + resourcecollection.project + "/" + resourcecollection.name;
        }
        resourcecollection.requestURL_prefix = "http://202.120.40.175:40011/Entity/";
        resourcecollection.requestURL = "";
        resourcecollection.conditions = new Array();
        resourcecollection.resultset = new Array();
        resourcecollection.perpage = -1;
        resourcecollection.page = -1;
        resourcecollection.setURL = function(_url) {
            if (typeof (_url) === "undefined" || _url.split("/").length < 3) {
                resourcecollection.userid = "";
                resourcecollection.project = "";
                resourcecollection.name = "";
            } else {
                resourcecollection.userid = _url.split("/")[0];
                resourcecollection.project = _url.split("/")[1];
                resourcecollection.name = _url.split("/")[2];
                resourcecollection.url = resourcecollection.userid + "/" + resourcecollection.project + "/" + resourcecollection.name;
            }
        };
        resourcecollection.setRequestURLPrefix = function(_prefix) {
            resourcecollection.requestURL_prefix = _prefix;
        };
        resourcecollection.getURL = function() {
            return resourcecollection.url;
        };
        resourcecollection.setPerpage = function(_perpage) {
            resourcecollection.perpage = _perpage;
        };
        resourcecollection.setPage = function(_page) {
            resourcecollection.page = _page;
        };
        resourcecollection.getPerpage = function() {
            return resourcecollection.perpage;
        };
        resourcecollection.getPage = function() {
            return resourcecollection.page;
        };
        resourcecollection.addGreatThan = function(variable, value) {
            variable = resourcecollection.name + "." + variable;
            if (typeof (variable) === "undefined" || typeof (variable) === "undefined") {
                return "<error>参数不能为空</error>";
            } else if (variable === "" || value === "") {
                return "<error>参数不能为空</error>";
            } else {
                resourcecollection.conditions.push(variable + "=(gt)" + value);
            }
        };
        resourcecollection.addGreatEqual = function(variable, value) {
            variable = resourcecollection.name + "." + variable;
            if (typeof (variable) === "undefined" || typeof (variable) === "undefined") {
                return "<error>参数不能为空</error>";
            } else if (variable === "" || value === "") {
                return "<error>参数不能为空</error>";
            } else {
                resourcecollection.conditions.push(variable + "=(gte)" + value);
            }
        };
        resourcecollection.addLittleThan = function(variable, value) {
            variable = resourcecollection.name + "." + variable;
            if (typeof (variable) === "undefined" || typeof (variable) === "undefined") {
                return "<error>参数不能为空</error>";
            } else if (variable === "" || value === "") {
                return "<error>参数不能为空</error>";
            } else {
                resourcecollection.conditions.push(variable + "=(lt)" + value);
            }
        };
        resourcecollection.addLittleEqual = function(variable, value) {
            variable = resourcecollection.name + "." + variable;
            if (typeof (variable) === "undefined" || typeof (variable) === "undefined") {
                return "<error>参数不能为空</error>";
            } else if (variable === "" || value === "") {
                return "<error>参数不能为空</error>";
            } else {
                resourcecollection.conditions.push(variable + "=(lte)" + value);
            }
        };
        resourcecollection.addEqual = function(variable, value) {
            variable = resourcecollection.name + "." + variable;
            if (typeof (variable) === "undefined" || typeof (variable) === "undefined") {
                return "<error>参数不能为空</error>";
            } else if (variable === "" || value === "") {
                return "<error>参数不能为空</error>";
            } else {
                resourcecollection.conditions.push(variable + "=" + value);
            }
        };
        resourcecollection.addLike = function(variable, value) {
            variable = resourcecollection.name + "." + variable;
            if (typeof (variable) === "undefined" || typeof (variable) === "undefined") {
                return "<error>参数不能为空</error>";
            } else if (variable === "" || value === "") {
                return "<error>参数不能为空</error>";
            } else {
                resourcecollection.conditions.push(variable + "=(like)" + value);
            }
        };
        resourcecollection.GET = function() {
            if (resourcecollection.project === "") {
                return "<error>资源uri不能为空</error>";
            } else {
                resourcecollection.requestURL = resourcecollection.requestURL_prefix + resourcecollection.url + "/";
                var condExist = false;
                if (resourcecollection.conditions.length !== 0) {
                    resourcecollection.requestURL += "?" + resourcecollection.conditions[0];
                    condExist = true;
                }
                for (var i = 1; i < resourcecollection.conditions.length; i++) {
                    resourcecollection.requestURL += "&" + resourcecollection.conditions[i];
                }
                if (resourcecollection.perpage !== -1) {
                    if (condExist === true) {
                        resourcecollection.requestURL += "&";
                    } else {
                    	resourcecollection.requestURL += "?";
                    }
                    resourcecollection.requestURL += "perpage=" + this.perpage;
                    condExist = true;
                }
                if (resourcecollection.page !== -1) {
                    if (condExist === true) {
                        resourcecollection.requestURL += "&";
                    } else {
                    	resourcecollection.requestURL += "?";
                    }
                    resourcecollection.requestURL += "page=" + this.page;
                }
                console.log(resourcecollection.requestURL);
                $.ajax({
                    type: "GET",
                    async: false,
                    url: resourcecollection.requestURL,
                    contentType: "application/xml",
                    datatype: "xml",
                    beforeSend: function(request) {
                        request.setRequestHeader("passwd", $.cookie('passwd'));
                    },
                    success: function(data) {
                        console.log(data);
                        resourcecollection.msg = "<succeed></succeed>";
                        if ($(data).find("error").text() !== "") {
                            //alert($(data).text());
                            resourcecollection.msg = "<error>" + ($(data).text()) + "</error>";
                        }
                        $(data).find(resourcecollection.userid + "_"
                                + resourcecollection.project + "_"
                                + resourcecollection.name).each(function() {
                            var that = this;
                            $(this).children().each(function() {
                                if ($(this).context.nodeName === "uri") {
                                    var uris = $(this).text().split("/");
                                    var singleResult = Resource.createNew(uris[1].split("_")[0] + "/"
                                            + uris[1].split("_")[1] + "/"
                                            + uris[1].split("_")[2] + "/"
                                            + uris[2], that);
                                    resourcecollection.resultset.push(singleResult);
                                }
                            });
                        });
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown) {
                        return textStatus;
                    }
                });
            }
        };
        resourcecollection.getResultSet = function() {
            return resourcecollection.resultset;
        };
        resourcecollection.getMsg = function() {
            return resourcecollection.msg;
        };
        return resourcecollection;
    }
};

