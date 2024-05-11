
var SVG_EDITOR = function () {
	var scope = this;
	
	this.svg = null;
	this.Paths = [];
	this.currPath = null;
	this.currIndx = null;
	this.mode = "";
	
	this.buildList = function() {
		$("#find_list").remove();
		$("#find_report").after("<details id='find_list' open><summary>Найденные пути</summary><ul></ul></details>");
		for (var i = 0; i < scope.Paths.length; i++ ) {
			var path = scope.Paths[i];
			var d = $(path).attr("d");
			if ( d )
				$("#find_list ul").append("<li><button class='copy_btn' title='копировать'>&copy;</button> <span data-indx='"+ i +"'>"+ d +"</span></li>");
			else
				$("#find_list ul").append("<li><span data-indx='"+ i +"'>нет данных</span></li>");
		}
	}
	
	this.find_svg = function () {
		scope.Paths = [];
		
		scope.svg = $("html").find("svg")[0];
		console.log(scope.svg);
		if ( scope.svg ) {
			var cn = scope.svg.className.baseVal;
			var id = scope.svg.id;
			$("#find_report").html("svg"+ ( cn ? "."+cn : "" ) + ( id ? "#"+id : "" ) +" найден");
			$("#add_block").show();
			
			var ch = $(scope.svg).find("path");
			console.log(ch);
			if ( ch.length ){
				for (var i = 0; i < ch.length; i++ ) {
					var path = ch[i];
					console.log(path);
					scope.Paths.push(path);
				}
				
			}else $("#find_report").append("нет путей");
			
		}else{
			$("#find_report").html("svg не найден");
		}
		
		console.log(scope.Paths);
				
		scope.buildList();
	}
	
	this.init = function () {
		if ( typeof $ != "function" ) {
			var jq = document.createElement("script");
			jq.src = "https://code.jquery.com/jquery-1.12.4.min.js";
			jq.setAttribute("integrity","sha256-ZosEbRLbNQzLpnKIkEdrPv7lOy9C27hHQ+Xp8a4MxAQ=");
			jq.setAttribute("crossorigin","anonymous");
			jq.onload = function () {
				var jqui = document.createElement("script");
				jqui.src = "https://code.jquery.com/ui/1.12.1/jquery-ui.min.js";
				jqui.setAttribute("integrity","sha256-VazP97ZCwtekAsvgPBSUwPFKdrwD3unUfSGVYrahUqU=");
				jqui.setAttribute("crossorigin","anonymous");
				jqui.onload = function () {
					scope.handle();
				}
				document.head.appendChild(jqui);
				
				var uitm = document.createElement("link");
				uitm.rel = "stylesheet";
				uitm.href = "http://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css";
				document.head.appendChild(uitm);
			}
			document.head.appendChild(jq);
		}else{
			if ( typeof $.dialog != "function" ) {
				var jqui = document.createElement("script");
				jqui.src = "https://code.jquery.com/ui/1.12.1/jquery-ui.min.js";
				jqui.setAttribute("integrity","sha256-VazP97ZCwtekAsvgPBSUwPFKdrwD3unUfSGVYrahUqU=");
				jqui.setAttribute("crossorigin","anonymous");
				jqui.onload = function () {
					scope.handle();
				}
				document.head.appendChild(jqui);
				
				var uitm = document.createElement("link");
				uitm.rel = "stylesheet";
				uitm.href = "https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css";
				document.head.appendChild(uitm);
				
			}else scope.handle();
		}
	}
	
	this.handle = function () {
		var html  = '<div id="svg_editor" style="display:none;">';
			html += '	<div>';
			html += '		<button id="find_svg">Найти &lt;svg&gt;</button>&nbsp;<span id="find_report"></span>';
			html += '	</div>';
			html += '	<div id="add_block" style="display:none;">';
			html += '		<button id="add_path">Добавить путь</button>';
			html += '		<div id="path_form" style="display:none;">';
			html += '			<button id="new_move">Move</button>';
			html += '			<button id="new_line">Line</button>';
			html += '			<button id="new_apply">Завершить</button>';
			html += '			<div id="path_data">Данные пути</div>';
			html += '		</div>';
			html += '	</div>';
			html += '</div>';
		
		
		$("body").append(html);
		
		var css  = "<style type='text/css'>";
			css += "path.new {";
			css += "	opacity: 0.75;";
			css += "	fill: #dc331b;";
			css += "}";
			css += "#find_list ul li{";
			css += "	margin-bottom: 6px;";
			css += "	white-space: nowrap;";
			css += "}";
			css += ".copy_btn {";
			css += "	display: inline !important;";
			css += "	padding: 1px 6px 0px;";
			css += "}";
			css += "#find_list ul li span:hover{";
			css += "	cursor: pointer;";
			css += "	text-decoration: underline;";
			css += "	color: blue;";
			css += "}";
			css += "</style>";
		
		$("head").append(css);
			
		$("#find_svg").on("click", scope.find_svg);
		
		$("#add_path").on("click", scope.add_path);
		$("#new_move").on("click", scope.new_move);
		$("#new_line").on("click", scope.new_line);
		$("#new_apply").on("click", scope.new_apply);
		
		$(document).on("change input", "input[type=number]", scope.oninput);
		$(document).on("click", "#find_list ul li span", function () { scope.selectPath(this.dataset.indx); });
		$(document).on("click", ".copy_btn", function (event) {
			var span = $(this).next("span").get(0);
			console.log(span);
			var range = document.createRange();
			range.selectNode(span);
			window.getSelection().addRange(range);
			
			try {
				var successful = document.execCommand('copy');
				var msg = successful ? 'successful' : 'unsuccessful';
				console.log('Copy command was ' + msg);
			} catch(err) {
				console.log('Oops, unable to copy');
			}
			
			window.getSelection().removeAllRanges();
		});
		
		$("#svg_editor").dialog({
			title: "Svg Path Editor",
			autoOpen: false, width: window.innerWidth / 3, height: window.innerHeight / 2,
			show: { effect: "blind", duration: 250 },
			hide: { effect: "explode", duration: 500 }
		});
		$("#svg_editor").dialog("open");
	}
	
	this.add_path = function () {
		scope.mode = "add";
		
		if ( scope.svg ) {
			var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
			path.setAttribute("class", "new");
			$(scope.svg).append(path);
			scope.currPath = path;
			$("#path_form").show();
			$("#add_path").hide();
			$("#new_line").hide();
			
		}else{
			$("#find_report").html("svg не найден");
		}
	}
	
	this.getCoords = function (event) {
		var currX = event.clientX - $(scope.svg).offset().left;
		var currY = event.clientY - $(scope.svg).offset().top;
		
		var vb = scope.svg.getAttribute("viewBox");
		if ( vb != undefined ) {
			var coords = vb.split(" ");
			var coefX = coords[2] / parseInt( $(scope.svg).css("width")  );
			var coefY = coords[3] / parseInt( $(scope.svg).css("height") );
			currX *= coefX;
			currY *= coefX;
		}
		
		currX = Math.floor(currX);
		currY = Math.floor(currY);
		
		console.log(currX +":"+ currY);
		return [currX, currY];
	}
	
	this.new_move = function () {
		if (scope.currPath) {
			$(scope.svg).on("click", function (event) {
				$(scope.svg).off("click");
				
				var coords = scope.getCoords(event);
				scope.currPath.setAttribute("d", "M"+ coords[0] +","+ coords[1]);
				$("#new_move").hide();
				$("#new_line").show();
				$("#path_data").append('<div class="path_part" data-part="M">M <input type="number" value="'+ coords[0] +'"> , <input type="number" value="'+ coords[1] +'"></div>');
			});
			
		}else console.log("нет пути для нового начала");
	}
	
	this.new_line = function () {
		if (scope.currPath) {
			$(scope.svg).on("click", function (event) {
				$(scope.svg).off("click");
				
				var coords = scope.getCoords(event);
				var d = $(scope.currPath).attr("d");
				$(scope.currPath).attr("d", d +"L"+ coords[0] +","+ coords[1]);
				$("#path_data").append('<div class="path_part" data-part="L">L <input type="number" value="'+ coords[0] +'"> , <input type="number" value="'+ coords[1] +'"></div>');
			});
			
		}else console.log("нет пути для новой линии");
	}
	
	this.new_apply = function () {
		if (scope.currPath) {
			$("#add_path").show();
			$("#new_move").show();
			$("#path_form").hide();
			$("#path_data").html("Данные пути");
			
			switch( scope.mode ) {
				case "add":
					scope.Paths.push(scope.currPath);
				break;
				
				case "edit":
				break;
			}
			scope.currPath = null;
			console.log(scope.Paths);
			scope.buildList();
			
		}else console.log("нет пути для добавления");
	}
	
	this.oninput = function () {
		var d = "";
		$(".path_part").each(function () {
			var ins = $(this).find("input");
			d += this.dataset.part + ins.get(0).value +","+ ins.get(1).value;
		});
		$(scope.currPath).attr("d", d);
	}
	
	this.selectPath = function (indx) {
		scope.mode = "edit";
		scope.currPath = scope.Paths[indx];
		console.log(scope.currPath);
		scope.buildForm();
	}
	
	this.buildForm = function () {
		var d = $(scope.currPath).attr("d");
		$("#path_form").show();
		$("#add_path").hide();
		$("#path_data").html("Данные пути");
		
		var parts = [];
		while ( d.length > 0 ){
			var part = d.substring( d.search(/[a-zA-Z]{1,}/ig), d.search(/[a-zA-Z]{1,}/ig) + 1 );
			d = d.replace(part,"");
			if ( part.match(/m/i) ) $("#new_move").hide();
			
			var coords = d.substring( 0, (d.search(/[a-zA-Z]{1,}/ig) > -1 ? d.search(/[a-zA-Z]{1,}/ig) : d.length) );
			d = d.replace(coords,"");
			parts = coords.split(",");
			$("#path_data").append('<div class="path_part" data-part="'+ part +'">'+ part +' <input type="number" value="'+ parts[0] +'"> , <input type="number" value="'+ parts[1] +'"></div>');
		}
	}
}

var SVG_E = new SVG_EDITOR();

SVG_E.init();
