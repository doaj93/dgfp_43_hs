			function SetCookie(name,value){
			var Days = 30; //此 cookie 将被保存 30 天

			var exp  = new Date();    //new Date("December 31, 9998");
			exp.setTime(exp.getTime() + Days*24*60*60*1000);
			document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();
			}
			
			function getCookie(name){
			var arr = document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
			if(arr != null) return unescape(arr[2]); 
			return null;
			}
			
			function delCookie(name){
			var exp = new Date();
			exp.setTime(exp.getTime() - 1);
			var cval=getCookie(name);
			if(cval!=null) document.cookie= name + "="+cval+";expires="+exp.toGMTString();
			}
			
            function testGET() {
			 //var resource = Resource.createNew("U3f1c1be22a3408/Project1/User/2454673988469300");
			 //resource.DELETE();
             var ress = ResourceCollection.createNew("U3f1c1be22a3408/Project1/User");
			 var us = document.getElementById("u").value;
             ress.addEqual("UserID", us);
             ress.GET();
             //alert(ress.getMsg());
             var result = ress.getResultSet();
			 if(result.length != 1){
			 alert("wrong username")
			 return;
			 }
			 var pp = result[0].getAttribute("UserPasswd");
             var p = document.getElementById("p").value; 
			 if(p == pp){
			 window.location.href = "index.html";
			 $.cookie('username',"fuckyou",{ expires:100});//     cookie here
			 var testStr=$.cookie('username');
			 alert($.cookie('username'));
			 }
			 else{
			 alert("not match!")
			 }
             }
             
             function testPUT() {
			 
             var resource = Resource.createNew("qas149/Product/19977258099766");
             resource.GET();
             var subresource = resource.listSpecificSubresources("ProductWithNoModule")[0];
             resource.addSubresource(subresource, "remove");
             resource.PUT();
             alert(resource.getMsg());
             }
             
             function testPOST() {
			 var user1 = document.getElementById("user").value;
			 var passwd1 = document.getElementById("passwd").value;
             var r1 = Resource.createNew("U3f1c1be22a3408/Project1/User/-1");
			 var r2 = ResourceCollection.createNew("U3f1c1be22a3408/Project1/User");
			 r2.addEqual("UserID", user1);
			 r2.GET();
			 var result = r2.getResultSet();
			 if(result.length > 0){
				alert("the username has been occupied!")
				return;
			 }
			 else{
             r1.addAttribute(Attribute.createNew("UserNum", "1"));
             r1.addAttribute(Attribute.createNew("UserID", user1.toString()));
             r1.addAttribute(Attribute.createNew("UserPasswd", passwd1.toString()));
             r1.addAttribute(Attribute.createNew("UserEmail", "597493748@qq.com"));
			 r1.addAttribute(Attribute.createNew("UserKind", "1"));
             r1.POST();
             alert(r1.getMsg());
             window.location.href = "index.html";         // 1
			 }
			 }