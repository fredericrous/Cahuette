/* MaxPhotographer - gallery.js */

var max_gallery = 2,
		landscape_max_height = 540,
		landscape_max_width = 380;
var gallery, section;

/* get obj gallery from json */
function get_gallery(success) {
	get_storage('storage/gallery.json', success, function() {
		init();
	});
}

/* get obj text from json */
function get_text(success) {
	get_storage('storage/text.json', success);
}

/* get json file */
function get_storage(text, success, error) {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', text, true);
	xhr.onreadystatechange = function(r) {
		r = r.target;
		if (r.readyState == 4 /* complete */) {
			if (r.responseText != "") {
				var result = JSON.parse(r.responseText);
				success(result);
			} else {
				error();
			}
		}
	};
	xhr.send();
}

function get_basename(elem) {
	var url = window.getComputedStyle(elem.getPropertyValue('background-image'));
	url = url.replace(/^url\(["']?.*(\\|\/)/, '').replace(/["']?\)$/, '');
	return 'gallery/' + url;
}

var mql = window.matchMedia("only screen and (max-width:480px)");
mql.addListener(function(m) {
	var e_load = document.getElementById('load');
	e_load.className = m.matches ? 'add' : 'add_inline';
	var n_img, url, style,
			ez_div = document.querySelectorAll('.img');
	for (var i in ez_div) {
			n_img = new Image();
			n_img.src = get_basename(ez_div[i]);
			n_img.onload = function(event) {
				var url, src = event.target.getAttribute('src'),
						ez_div = document.querySelectorAll('.img'),
						height = landscape_max_width * (event.target.height / event.target.width),
						width = landscape_max_height * (event.target.width / event.target.height);
				height = 'height: ' + Math.round(height) + 'px;';
				width = 'width: ' + Math.round(width) + 'px;';
				for (var i = 0; i < ez_div.length; i++) {
					url = get_basename(ez_div[i]);
					if (url == src) {
						ez_div[i].setAttribute('style', 'background-image: url(' + url + '); '
																		+ ((m.matches) ? height : width)); 
					}
				}
				if (ez_div[i] == ez_div[ez_div.length - 1]) {
					e_load.className = 'remove';
				}
			};
	}
});

function img_resize(img, height, width) {
	var e_canvas = document.createElement('canvas');
	if (height != null) {
		e_canvas.width = Math.round(height * (img.width / img.height));
	  e_canvas.height = height;
	} else {
		e_canvas.height = Math.round(width * (img.height / img.width));
		e_canvas.width = width;
	}
  var ctx = e_canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, e_canvas.width, e_canvas.height);
  return e_canvas;
}

var g_count = 0;
/* add an image to the gallery */
function create_img_gallery(img) {
	var e_img = document.createElement('div'),
			e_load = document.getElementById('load'),
			e_img_attr = document.createAttribute('style');
				
	if (img == undefined || g_gallery == null) return;
	
	var n_img = new Image();
	n_img.src = img.url;
	n_img.onload = function(event) {
			
			if (window.matchMedia("only screen and (max-width:480px)").matches) {
				e_img.appendChild(img_resize(event.target, null, landscape_max_width));
			} else {
				e_img.appendChild(img_resize(event.target, landscape_max_height));
			}

		e_img_attr = document.createAttribute('class');
		e_img_attr.nodeValue = 'img';
		e_img.setAttributeNode(e_img_attr);
	
		var btz = null;
		e_img.addEventListener('click', function(event) {
			var elem = event.target.parentNode,
					token = localStorage.getItem('token');
			if (token != undefined && token != null) {
				if (elem.childNodes.length == 1) {
					elem.appendChild(document.createElement('span'));
				} else {
					elem.removeChild(elem.lastChild);
				}
				if (btz == null) {
					btz = document.querySelectorAll('.bt_up, .bt_down');
				}
				var nbr_imgz = (get_selected_images()).length;
				for (var i = 0; i < btz.length; i++) {
					btz[i].className = btz[i].className.replace(/add_inline|remove/, '')
															+ ' ' + (nbr_imgz == 1 ? 'add_inline' : 'remove');
				}
			}
		});
		g_count++;
		if (g_count % max_gallery == 0 || gallery[section].length - g_count < max_gallery) {
			tmp_imgz = tmp_imgz.reverse();
			var elem,
					e_load = document.getElementById('load');
			while (elem = tmp_imgz.pop()) {
				g_gallery.insertBefore(elem, e_load);	
			}
			tmp_imgz = [];
			e_load.className = 'remove';
		}
	};
	return e_img;
}

/* fill the menu*/
function fill_menu(result) {
	var e_menu = document.getElementById('menu'),
			e_ul = e_menu.getElementsByTagName('ul')[0];
	result = Object.keys(result);
	for (var section in result) {
		add_menu_section(result[section], e_menu, e_ul);
	}
}

/* add images to gallery */
function generate_gallery(gallery, name, max) {
	var e_img,
			i = 0;
	e_load.className = mql.matches ? 'add' : 'add_inline';
	for (var img in gallery[name]) {
		if (i++ > max - 1) {
			break;
		}
		e_img = create_img_gallery(gallery[name][img]);
		g_gallery.insertBefore(e_img, e_load);
	}
}

function clear_gallery() {
	var all_imgs = g_gallery.getElementsByClassName('img');
	if (all_imgs.length > 0) {
		while (all_imgs.length != 0) {
			g_gallery.removeChild(all_imgs[all_imgs.length - 1]);
		}
	}
}

/* add section to menu */
function add_menu_section(name, e_menu, e_ul) {
	var e_li = document.createElement('li'),
			e_a = document.createElement('a'),
			e_a_attr = document.createAttribute('href');
	
	e_a.innerHTML = name;

	e_a_attr.nodeValue = '#' + name;
	e_a.setAttributeNode(e_a_attr);
	
	e_a.addEventListener('click', function() {
		//remove previous images in gallery
		clear_gallery();
		
		//add section's imgages to gallery
		generate_gallery(gallery, name, max_gallery);
		
		section = name;
		localStorage.setItem('section', section);
		//console.log(gallery[name]);
	});
	e_li.appendChild(e_a);
	
	e_ul.appendChild(e_li);
}

//trigger whenever gallery has been fully scrolled to the right
var g_gallery = document.getElementById('gallery');
if (g_gallery != null) {
	var tmp_imgz = [];
	var e_load = document.getElementById('load');
	g_gallery.addEventListener('scroll', function() {
		if (g_gallery.scrollWidth - g_gallery.offsetWidth <= g_gallery.scrollLeft)
		{
			add_img_gallery();
		}
	});
}

function add_img_gallery() {
	var nb_all_imgs = g_gallery.getElementsByClassName('img').length,
			nb_gallery = gallery[section].length;
 	if (nb_gallery > nb_all_imgs) {
		e_load.className = mql.matches ? 'add' : 'add_inline';

		var e_img, i = 0;
		while (nb_gallery > nb_all_imgs + i && i < max_gallery) {
			e_img = create_img_gallery(gallery[section][nb_all_imgs + i++]);
			tmp_imgz.push(e_img);
		}
	}
}

window.addEventListener('scroll', function(event) {
		if (mql.matches) {
			if (window.pageYOffset == document.documentElement.scrollHeight - document.documentElement.clientHeight) {
				add_img_gallery();
			}
		}
});

//get arg in url after #
function get_UrlArg() {
	var loc = window.location.href;
	var loc_separator = loc.indexOf('#');
	return (loc_separator == -1) ? '' : loc.substr(loc_separator + 1);
}
section = get_UrlArg();


//fill menu and gallery
get_gallery(function(result) {
	gallery = result;
	fill_menu(gallery);
	var keys = Object.keys(gallery);
	if (location.search == '?login') {
			section = localStorage.getItem('section') || keys[0];
	} else {
			section = (keys.indexOf(section) != -1) ? section : keys[0];
	}
	if (g_gallery != null) {
		generate_gallery(gallery, section, max_gallery);	
	}
	if (typeof init == 'function') {
	  init();
	}
});


//drag gallery
var dragged, offsetX,
 		g_gallery = document.getElementById('gallery');
if (g_gallery != null) {
	g_gallery.onmousedown = function(event) {
		dragged = false;
	    if (event.button == 2) return;
			if (event.screenY < g_gallery.parentNode.offsetHeight - 5) { //correct bug no mouseup trigger after use of scrollbar
				dragged = true;
			}
	    offsetX = event.screenX - this.offsetLeft;
	    return false;
	}

	g_gallery.onmousemove = function(event) {
		if (dragged) {
			g_gallery.scrollLeft = g_gallery.scrollLeft - (event.screenX - offsetX) / 7; //the division slows the slide by cursor
		}
	} 
     
	g_gallery.onmouseup = function() {
	  if (dragged) {
			dragged = false;
	  }
	}

}