function removeWelcome(){
 				var e = document.getElementById('welcome');
 				e.parentNode.parentNode.removeChild(e.parentNode);
 				var audio = document.getElementById("casinoAudio");
 				audio.volume = 0.7;
 				audio.play();
 			}

 			function hideMessage(e){
 				if(e=="alert") document.getElementById('alert').className = "hidden";
 				else document.getElementById('congrats').className = "hidden";
                 document.getElementById("code-mob").value = "";
                 document.getElementById("code-desk").value = "";
                 document.getElementById("confetti1").className = "confetti hidden";
                 document.getElementById("confetti2").className = "confetti hidden";
 				resetWheel();
 			}

 			let wincode = "";
 			let phone = "";
 			let whatsapp = "";
             let theWheel = new Winwheel({
                 'numSegments'   : 12,
                 'outerRadius'   : 185,
                 'innerRadius'   : 75,
                 'textFontSize'  : 18,
                 'textMargin'    : 0,
                 'segments'      :
                 [
                    {'fillStyle' : '#ff0000', 'text' : 'IPHONE-17', 'textFillStyle' : '#c3da08'},
                    {'fillStyle' : '#ff0000', 'text' : 'PS-5', 'textFillStyle' : '#c3da08'},
                    {'fillStyle' : '#c3da08', 'text' : '10,000,000', 'textFillStyle' : '#1e9201'},
                    {'fillStyle' : '#1e9201', 'text' : '5,000,000', 'textFillStyle' : '#c3da08'},
                    {'fillStyle' : '#ff0000', 'text' : 'VERSYS-650', 'textFillStyle' : '#fff', 'textFontSize': '15'},
                    {'fillStyle' : '#c3da08', 'text' : '1,000,000', 'textFillStyle' : '#1e9201'},
                    {'fillStyle' : '#1e9201', 'text' : '500,000', 'textFillStyle' : '#c3da08'},
                    {'fillStyle' : '#c3da08', 'text' : '100,000', 'textFillStyle' : '#1e9201'},
                    {'fillStyle' : '#1e9201', 'text' : '50,000', 'textFillStyle' : '#c3da08'},
                    {'fillStyle' : '#c3da08', 'text' : '20,000', 'textFillStyle' : '#1e9201'},
                    {'fillStyle' : '#1e9201', 'text' : 'CASHBACK 10%', 'textFillStyle' : '#c3da08', 'textFontSize': '13'},
                    {'fillStyle' : '#c3da08', 'text' : 'BONUS DP 10%', 'textFillStyle' : '#1e9201', 'textFontSize': '14'}
                 ],
                 'animation' :
                 {
                     'type'     : 'spinToStop',
                     'duration' : 4,
                     'spins'    : 12,
                     'callbackFinished' : alertPrize
                 }
             });

 			let xhr = new XMLHttpRequest();
 			xhr.onreadystatechange = ajaxStateChange;

 			function calculatePrizeOnServer(code){
 				const API_BASE = ""; // Set to your backend URL if GitHub Pages is used.
                xhr.open("GET", API_BASE + "/wheel/start/" + encodeURIComponent(code) + "?_=" + new Date().getTime(), true);
 				xhr.send();
 			}

 			function ajaxStateChange(){
 				if (xhr.readyState < 4)
 					return;

 				if(xhr.status !== 200) {
 					displayAlert("Terjadi Kesalahan Sistem, Halaman Akan Reload Dalam 5 Detik..");
 					setTimeout(function(){location.reload(true)},5000);
 					return;
 				}

 				if (xhr.readyState === 4) {
 					let resp = xhr.responseText;
 					if(resp.trim().length>2){
 						resp = atob(resp);
 						resp = resp.split("-");
 						let segmentNumber = resp[0];
 						wincode = resp[1];
 						website = resp[2];
 						whatsapp = resp[3];

 						if (segmentNumber && parseInt(segmentNumber) > 0) {
 							document.getElementById("spinAudio").play();
 							setTimeout(function(){
 								let stopAt = theWheel.getRandomForSegment(segmentNumber);
 								theWheel.animation.stopAngle = stopAt;
 								theWheel.startAnimation();
 							},100);
 						}
 					}
 					else if(resp.trim()=="-1")
 						displayAlert("Maaf Kode Yang Kamu Masukkan Sudah Kadaluarsa, Harap Hubungi CS Untuk Mendapatkan Kode Baru!");
 					else if(resp.trim()=="")
 						displayAlert("Maaf Kode Yang Kamu Masukkan Salah, Harap Hubungi Customer Service Untuk Mendapatkan Kode Tiket!");
 				}
 			}
 <br>
             let wheelPower    = 0;
             let wheelSpinning = false;
 <br>
             function startSpin(mode){
 				var element = (mode==0) ? "code-mob" : "code-desk";

 				if(document.querySelector("#"+element).value.trim()==""){
 					displayAlert("Masukkan Kode Tiket Terlebih Dahulu!");
 					return;
 				}

 				var code = document.querySelector("#"+element).value.trim();

                 if (wheelSpinning == false) {
 					theWheel.animation.spins = 3;
 <br>
                     document.getElementById('spin_button').src       = "spin_off.png";
                     document.getElementById('spin_button').className = "";
 <br>
 					calculatePrizeOnServer(code);

                     wheelSpinning = true;
                 }
             }

             function resetWheel() {
                 theWheel.stopAnimation(false);
                 theWheel.rotationAngle = 0;
                 theWheel.draw();
 <br>
 				document.getElementById('spin_button').src = "spin_on.png";
 				document.getElementById('spin_button').className = "clickable";
 <br>
                 wheelSpinning = false;
             }

             function alertPrize(indicatedSegment){
 				document.getElementById("congratsAudio").play();
 				let text = "halo, saya mau klaim wheel of fortune dengan kode kemenangan "+wincode;
 				text = encodeURIComponent(text);
 				var prize = indicatedSegment.text;
 		switch(prize){
 			case "IPHONE-17":
 				prize = "IPHONE 17 PRO MAX";
 				break;
 			case "PS-5":
 				prize = "Playstation 5";
 				break;
 			case "CASHBACK 10%":
 				prize = "CASHBACK 10%";
 				break;
 			case "VERSYS-650":
 				prize = "VERSYS 650cc";
 				break;
 			case "BONUS DP 10%":
 				prize = "BONUS DEPOSIT 10%";
 				break;
 			default:
 				prize = prize + " CREDIT";
 				break;
 		}

     			var msg =
     					"<div style='text-align:center'>"+
     						"<img src='congrats.png' alt='congrats' style='width:40px;position:relative;top:-8px;vertical-align: middle;'/> "+
     						"SELAMAT! ANDA MEMENANGKAN HADIAH <span style='color:gold'><b>" + prize + "</b></span>! "+
     						"<img src='congrats.png' alt='congrats' style='width:40px;position:relative;top:-8px;vertical-align: middle;'/>"+
     					"</div>" +
     					"<div style='text-align:center'>"+
     						"<div><b>CATAT</b> Kode Kemenangan Anda: <b style='color:gold;'>" + wincode + "</b></div>"+
     						"<div>"+
     							"<b>Klaim Melalui:</b> "+
     							"<div class='claim'><i class='fa fa-whatsapp' style='color:gold'></i> <a href='https://api.whatsapp.com/send?phone="+whatsapp+"&text="+text+"' target='_blank' style='color:#fbe57a'>Whatsapp</a></div>"+
     						"</div>"+
     						"<div style='text-align:center;margin:10px 0;'>Untuk mendapatkan extra kode kupon undian silahkan share kemenanganmu,<br/> dan follow media sosial seperti Instagram, Facebook, dan Twitter</div>" +
     						"<div style='margin:10px 0;text-align:center'>"+
     						    "<a href='https://www\.instagram.com/bigsloto/'><i class='fa fa-instagram' style='color:gold;font-size:2.5em'></i></a>&nbsp;&nbsp;"+
     						    "<a href='https://facebook.com/bigsloto'><i class='fa fa-facebook-square' style='color:gold;font-size:2.5em'></i></a>&nbsp;&nbsp;"+
     						    "<a href='https://twitter.com/bigsloto'><i class='fa fa-twitter-square' style='color:gold;font-size:2.5em'></i></a>"+
     					    "</div>" +
     					"</div>";

     			if(indicatedSegment.text=="ZONK"){
     				msg =
     					"<div style='text-align:center'>"+
     						"<b>Yaah ZONK, Anda Kurang Beruntung!</b> "+
     					"</div>" +
     					"<div style='text-align:center;margin-top:10px'>"+
     						"<div>Silahkan Coba kembali, Tingkatkan Terus Deposit Anda, Semoga beruntung di lain Kesempatan Ya!</div>"+
     					"</div>" +
     					"<div style='align:center;margin-top:10px'>Follow media sosial seperti Instagram, Facebook, dan Twitter untuk mendapatkan Promosi terbaru!</div>" +
     					"<div style='margin:10px 0;text-align:center'>"+
     					    "<a href='https://www\.instagram.com/bigsloto/'><i class='fa fa-instagram' style='color:gold;font-size:2.5em'></i></a>&nbsp;&nbsp;"+
     					    "<a href='https://facebook.com/bigsloto'><i class='fa fa-facebook-square' style='color:gold;font-size:2.5em'></i></a>&nbsp;&nbsp;"+
     					    "<a href='https://twitter.com/bigsloto'><i class='fa fa-twitter-square' style='color:gold;font-size:2.5em'></i></a>"+
     				    "</div>";
     				displayCongrats(msg,0);
     			}
     			else
     				displayCongrats(msg,1);
             }

             function displayCongrats(message,win){
             	document.getElementById('congrats-text').innerHTML = message;
             	if(win){
             		document.getElementById("confetti1").className = "confetti";
             		document.getElementById("confetti2").className = "confetti";
             	}
             	document.getElementById('alert').className = "hidden";
             	document.getElementById('congrats').className = "";
             }

 			function displayAlert(message){
 				document.getElementById('alert-text').innerHTML = message;
 				document.getElementById('congrats').className = "hidden";
 				document.getElementById('alert').className = "";
 			}
