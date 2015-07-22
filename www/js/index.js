var server = "http://www.unhcr.org/cgi-bin/texis/vtx/mappmodules/";
var server = "http://www.unhcr.org/mapp/";
var server = "www-auth.unhcr.org/cgi-bin/texis/vtx/mappmodules/";
//var server = "intranetapps.unhcr.org/a47focus-data/XML/DIMITRI_TEMP/content.xml";
//var server = "http://swiged77.hcrnet.ch/cgi-bin/texis.exe/unhcr/frontend/";
var lcode, username, mappauth;
var xmlData, catTitle, shareMessage, shareSubject, sharePdfId, shareAttach;
var pushNotification, iabRef;
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        initPushwoosh();
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        onLoadEvents();
    }
};
function onLoadEvents() {

    $(function() {
        FastClick.attach(document.body);
    });   
    $(document).on( "mobileinit", function() { 
      $.support.cors = true; 
      jQuery.support.cors = true;
      $.mobile.allowCrossDomainPages = true; 
      $.mobile.phonegapNavigationEnabled = true;
    });      
    doInterface();            
    //alert("onload");
    $("[name=lcode]").change(function() {
        window.localStorage.setItem("lcode", $('input[name=lcode]:checked').val());
        getdata();
    }); 
    $('#reload').click(function() {
        getdata();
    });
    $('#panelVideoBack').click(function() {
      $("#panelVideo .ui-content").html("");
    }); 
    $('#btnLogin').click(function() {
      login();
    });    
    $('#btnLogout').click(function() {
      logout();
    });
    $('#panelDocview #docviewShare').click(function() {
      getShare();
    });                    
    lcode = window.localStorage.getItem("lcode");
    if(!lcode){window.localStorage.setItem("lcode","EN");} 

    username = window.localStorage.getItem("username");
    mappauth = window.localStorage.getItem("mappauth");
    if(username && mappauth){
        getdata();
    }else{
        $.mobile.pageContainer.pagecontainer("change", "#panelLogin", { transition: "fade" });           
    } 


    //alert(lcode);
    //window.localStorage.removeItem( 'lcode' );

    $(document).on('pageshow', function(){
        $(".inlineLink").click(function() {
          var myUrl = $(this).attr("href");
          if (myUrl.search("http")==-1){myUrl = "http://www.unhcr.org" + myUrl;}
          myUrl = encodeURI(myUrl);
          iabRef = window.open(myUrl, '_system', 'location=yes,EnableViewPortScale=yes');
          return false;
        });    
        $(".inlinePDF").click(function(){
          var pdfUrl = $(this).attr("href");
          getpdf(pdfUrl, 'y');
          return false;
        });                
    });            
}

function getpdf(pdfUrl, openpdf) {
  loadingshow();  
  username = window.localStorage.getItem("username");
  mappauth = window.localStorage.getItem("mappauth");
  var myurl = "https://" + server + "inlinePDF.pdf?miid=" + pdfUrl;
  //var myurl = "http://www.unhcr.org/cgi-bin/texis/vtx/mappmodules/inlinePDF.pdf?miid=" + pdfUrl;          
  //iabRef = window.open(myurl, '_blank', 'location=yes,EnableViewPortScale=yes,Authorization=Basic ' + btoa(username + ":" + password));

  // !! Assumes variable fileURL contains a valid URL to a path on the device,
  //    for example, cdvfile://localhost/persistent/path/to/downloads/
  var filePath = "cdvfile://localhost/persistent/path/to/downloads/" + pdfUrl + ".pdf";

  var fileTransfer = new FileTransfer();
  var uri = encodeURI(myurl);
  var pdfauth = "Basic " + mappauth;

  fileTransfer.download(
      uri,
      filePath,
      function(entry) {
          console.log("download complete: " + entry.fullPath);
          var fileURL = entry.toNativeURL();
          //alert(fileURL); 
          $.mobile.loading( "hide" );
          if (openpdf == "y"){                 
            if(device.platform == "Android"){
              shareAttach = fileURL;
              //use fileopener on Android
              cordova.plugins.fileOpener2.open(
                  fileURL, 
                  'application/pdf', 
                  { 
                      error : function(errorObj) { 
                          //alert('Error status: ' + errorObj.status + ' - Error message: ' + errorObj.message); 
                      },
                      success : function () {
                          //alert('file opened successfully');              
                      }
                  }
              );
            }else{
              shareAttach = fileURL.replace("file\:\/\/", "");
              //use inappbrowser on iOS
              iabRef = window.open(filePath, '_blank', 'location=no,EnableViewPortScale=yes');  
              iabRef.addEventListener("exit", function(event) {iabRef.close();});
            }
          }
      },
      function(error) {
          //alert("download error source " + error.source);
          //alert("download error target " + error.target);
          //alert("upload error code" + error.code);
      },
      false,
      {
          headers: {
              "Authorization": pdfauth
          }
      }              
  );
}

function getShare() {

//alert(shareTitle + " - " + shareLink);
  if (sharePdfId == ""){
    window.plugin.email.open({
        subject: shareSubject,
        body:    shareMessage,
        isHtml:  true
    });
  }else{
    getpdf(sharePdfId, 'n');
    window.plugin.email.open({
        subject: shareSubject,
        attachments: [shareAttach],
        body:    shareMessage,
        isHtml:  true
    });

  }
}
function login() {

    var user = $('#username').val();
    var pass = btoa(user + ':' + $('#password').val());    
    if(user && pass){
            window.localStorage.setItem("username",user);
            window.localStorage.setItem("mappauth",pass);
            $("#homePage").html("");
            getdata();                   
        }else{

        } 
}
function logout() {
    window.localStorage.setItem("username","");
    window.localStorage.setItem("mappauth","");
    $('#username').val('');
    $('#password').val('');
    $("#homePage").html("");      
    $.mobile.loading( "hide" );  
    $.mobile.pageContainer.pagecontainer("change", "#panelLogin", { transition: "fade" }); 
}
function getdata() {
  loadingshow();  
  var lcode = window.localStorage.getItem("lcode"); 
  //var lcode = "EN";
  var rand_no = Math.floor((999999-1)*Math.random()) + 1;  
  username = window.localStorage.getItem("username");
  mappauth = window.localStorage.getItem("mappauth");
  $("#loggeduser").html(username);
  //var auth = 'Basic ' + btoa(username + ':' + mappauth);  
  var myurl = "https://" + server + "getXML.xml?LCODE=" + lcode;
  //var myurl = "https://" + server ;  
  //alert(myurl);
    //requestHeaders : { Authorization : auth },      
  $.ajax({
    type: "GET",
    url: myurl,
    dataType: "xml",
    crossDomain: true, 
    beforeSend: function(xhr) { xhr.setRequestHeader("Authorization", "Basic " + mappauth); },   
    success: parseXml,
    error: function (request, status, error) {
    alert(error);
        $.mobile.loading( "hide" );             
        navigator.notification.alert('Could not connect to server!', alertDismissed, 'UNHCR MAPP','OK');
        $.mobile.pageContainer.pagecontainer("change", "#panelLogin", { transition: "fade" }); 
    }    
  });
}
function doInterface()
{
  var lcode = window.localStorage.getItem("lcode");
  if(!lcode){window.localStorage.setItem("lcode","EN");}
  var intfile = "res/interface-" + lcode + ".json";
  if (device.platform == "WinCE" || device.platform == "Win32NT"){
    intfile = "./" + intfile;
  }
  
  $.ajax(intfile, {
  dataType: 'json', isLocal: true, success: function (interface) {
    loadingText = interface.loading;
    //loadingshow();    
    $("#loggedin").text(interface.loggedin);    
    $("#logout").text(interface.logout);
    //donateLink = interface.mi4link;            
    var chk, inthtml;
    inthtml = '<fieldset id="languageSettings" data-role="controlgroup" data-type="horizontal" data-mini="true">';
    inthtml += '<legend>'+interface.selectlanguage+'</legend>';
    if (lcode == "EN"){chk = 'checked="checked"';}else{chk = '';}
    inthtml += '<input name="lcode" id="radio-EN" value="EN" type="radio"' + chk + '><label for="radio-EN">'+interface.english+'</label>';
    if (lcode == "FR"){chk = 'checked="checked"';}else{chk = '';}
    inthtml += '<input name="lcode" id="radio-FR" value="FR" type="radio"' + chk + '><label for="radio-FR">'+interface.french+'</label>';    
    if (lcode == "AR"){chk = 'checked="checked"';}else{chk = '';}
    inthtml += '<input name="lcode" id="radio-AR" value="AR" type="radio"' + chk + '><label for="radio-AR">'+interface.arabic+'</label></fieldset>'; 
    $("#frmSettings").html(inthtml);
    $("#version").html("Version 1.0");       
    $("#panelSettings").trigger('create');
    $("#languageSettings [name=lcode]").on("change", function() {
        window.localStorage.setItem("lcode", $('input[name=lcode]:checked').val());
        doInterface();
        getdata();
    });
    $("a.close").text(interface.close);
    $("a.back").text(interface.back);  
    } 
  });
}
function loadingshow() {  
  $.mobile.loading( 'show', {
    textVisible: true,
    text : "Loading...",
    theme: "b"
    });
}
function getdata2() {
  loadingshow();  
  //var lcode = window.localStorage.getItem("lcode"); 
  //lcode = "EN";
  var rand_no = Math.floor((999999-1)*Math.random()) + 1;  
  var myurl = server + "mappmodules/getXML.xml?LCODE=" + lcode + "&rand=" + rand_no;
  var myurl = server + "mapp.xml?" + "&rand=" + rand_no;
  //var myurl = "mapp.xml?" + "&rand=" + rand_no;
  $.ajax({
    type: "GET",
    url: myurl,
    dataType: "xml",
    crossDomain: true,
    success: parseXml,
    error: function (request, status, error) {
        //navigator.notification.alert('Could not connect to server!', alertDismissed, 'UNHCR MAPP','OK');   
    }    
  });
}
function parseXml(xml)
{
  $("#homePage").html("");
  var lcode = window.localStorage.getItem("lcode");
  $.mobile.pageContainer.pagecontainer("change", "#panelMain", { transition: "none" });        
  $(xml).find("cat").each(function()
  { 
    if($(this).find("item").length > 0){

      $("#homePage").append('<div id="catSwiper' + $(this).attr("id") + '" class="swiper-container"><div class="swiper-title"></div><div class="swiper-wrapper"><div class="swiper-slide"></div></div></div>');
      target = "#catSwiper" + $(this).attr("id");
      catTitle = $(this).attr("name");
      $(target + " .swiper-title").text(catTitle.toUpperCase());
      $(target + " .swiper-title").attr("title", catTitle);      
      var emNo = ($(this).find("item").length * 125);
      $(target + " .swiper-slide").css("width", emNo);
      $(this).find("item").each(function()
      { 
        $(target + " .swiper-slide").append("<div class='item'><img src='http://www.unhcr.org/thumb0/" + $(this).attr("mid") + ".jpg'><p class='" + lcode + "'><a class='newsdoc' href='" + $(this).attr("id") + "'><span>" + $(this).attr("mtitle") + "</span></a></p></div>");
      }); 
    }
  });
  initSwiper(".swiper-container");
  $( 'a.newsdoc' ).on( "click", function() {
    getDoc($(this).attr('href'));
    return false;
  }); 
  xmlData = xml;
  xml = ""; 
  if (lcode == "AR"){
    $("h1.ui-title").addClass("AR");
  }else{
    $("h1.ui-title").removeClass("AR");  
  }
  //$('.swiper-slide p').ellipsis();
  $.mobile.loading( "hide" );  
}

function getDoc(id) {
  loadingshow();  
  var lcode = window.localStorage.getItem("lcode"); 
  var myhtmlHead;
  $("#panelDocview .ui-content").html("");  
  $(xmlData).find("item#"+id).each(function()
  {
    $("#panelDocview [data-role=header] h1").html($(this).find("cat").text());         
    myhtmlHead = "<div class='docHeader " + lcode + "'><img src='http://www.unhcr.org/thumb3/" + $(this).attr('mid') + ".jpg'/><div class='headerBack'><div class='headerText'><h3>" + $(this).attr('mtitle') + "</h3>" + "<p><strong>" + $(this).find("cat").text() + "</strong> - " + $(this).find("date").text() + "</p></div></div></div>"; 
    if ($(this).attr('itype') == "video"){
      if ($( window ).width() > 300){var ifrWidth = ($( window ).width()*0.6);};
      myhtmlHead = "<div style='padding:5px;'><h3 class='docTitle'>" + $(this).attr('mtitle') + "</h3><iframe src='http://www.youtube.com/embed/" + $(this).attr('ytid') + "?modestbranding=1&amp;rel=0&amp;html5=1' width='100%' height='" + ifrWidth + "' allowfullscreen frameborder='0'></iframe></div>";
    }
    var myhtml = "<div class='docBody " + lcode + "'>" + $(this).find("docbody").text() + "</div>";
    myhtml.replace('&quot;', '"');
    //alert(lcode);
    if ($(this).attr('haspdf') == "y"){
      var pdflink = "<div><a href=" + id + " class='inlinePDF'><img src='http://www.unhcr.org/images/furniture/pdf-download.png' alt='Download PDF'></a></div>";
      $("#panelDocview .ui-content").html(myhtml+pdflink);
      sharePdfId = id;
    }else{  
      $("#panelDocview .ui-content").html(myhtml);
      sharePdfId = "";      
    }
    shareMessage = "<!DOCTYPE html><html><head><meta charset='utf-8'/><title>" + $(this).attr('mtitle') + " </title><head><body>" + myhtmlHead + myhtml + "</body></html>";
    shareSubject = $(this).attr('mtitle');
    $("#panelDocview .ui-content a:not(.inlinePDF)").each(function(){
      if(this.href.indexOf('mailto') == -1){
        $(this).addClass("inlineLink");  
      }
    });
  });
  $.mobile.pageContainer.pagecontainer("change", "#panelDocview", { transition: "slide" }); 
    //alert(myhtmlHead);
  $("#panelDocview .ui-content").prepend(myhtmlHead); 
  $.mobile.loading( "hide" );     
}

function getVid(id) { 
  loadingshow();  
  var lcode = window.localStorage.getItem("lcode"); 
  var myhtml = "<iframe src='http://www.youtube.com/embed/" + id + "?modestbranding=1&amp;rel=0&amp;html5=1' width='100%' height='100%' allowfullscreen frameborder='0'></iframe>";
  $("#panelVideo .ui-content").html(myhtml);
  $.mobile.changePage( "#panelVideo" );  
  
     
}
function getGallery(id) { 
  loadingshow();  
  var lcode = window.localStorage.getItem("lcode"); 
  var myurl = server + "appmodules/getGallery.xml?LCODE=" + lcode + "&ID=" + id;
  var myhtml = "";
  $.ajax({
    type: "GET",
    url: myurl,
    dataType: "xml",
    success: function( xml ) {
      $(xml).find("item").each(function(){
        myhtml = "<h3 class='docTitle'>" + $(xml).find("title").text() + "</h3><p class='docDateBar'><small><strong>" + $(xml).find("cat").text() + "</strong>, " + $(xml).find("date").text() + "</small></p>" + $(xml).find("desc").text() + "<ul id='gallery' class='gallery'>";
        $(this).find("photo").each(function(){
          myhtml = myhtml + '<li><a href="http://www.unhcr.org/thumb1/' + $(this).attr("mid") + '.jpg" rel="external"><img src="http://www.unhcr.org/thumb0/' + $(this).attr("mid") + '.jpg" alt="' + $(this).text() + '"/></a></li>';
        });
        myhtml = myhtml + "</ul>";
      });
      if(lcode == "AR"){myhtml = "<div id='arabicDoc'><style>div.ps-caption{direction:rtl;}</style>" + myhtml + "</div>"}       
      $("#panelGallery .ui-content").html(myhtml);
      $.mobile.changePage( "#panelGallery" );       
    },
    error: function (request, status, error) {
        //alert("Could not connect to server");
        $.mobile.loading( "hide" );
    }       
  })
}

function initSwiper(target) {
  $(target).each(function( index ) {
      $(this).swiper({
        scrollContainer: true,
        autoResize: false,
        resizeReInit: true
      })
  }); 
}
function alertDismissed() {
    $.mobile.loading( "hide" );
}
function registerPushwooshIOS() {
  var pushNotification = window.plugins.pushNotification;

  //push notifications handler
  document.addEventListener('push-notification', function(event) {
        var notification = event.notification;
        navigator.notification.alert(notification.aps.alert);
        
        //to view full push payload
        //navigator.notification.alert(JSON.stringify(notification));
        
        //reset badges on icon
        pushNotification.setApplicationIconBadgeNumber(0);
        });

  pushNotification.registerDevice({alert:true, badge:true, sound:true, pw_appid:"A19F3-083EA", appname:"UNHCR MAPP"},
                  function(status) {
                    var deviceToken = status['deviceToken'];
                    console.warn('registerDevice: ' + deviceToken);
                    onPushwooshiOSInitialized(deviceToken);
                  },
                  function(status) {
                    console.warn('failed to register : ' + JSON.stringify(status));
                    navigator.notification.alert(JSON.stringify(['failed to register ', status]));
                  });
  
  //reset badges on start
  pushNotification.setApplicationIconBadgeNumber(0);
}

function onPushwooshiOSInitialized(pushToken)
{
  var pushNotification = window.plugins.pushNotification;
  //retrieve the tags for the device
  pushNotification.getTags(function(tags) {
                console.warn('tags for the device: ' + JSON.stringify(tags));
               },
               function(error) {
                console.warn('get tags error: ' + JSON.stringify(error));
               });
   
  //start geo tracking. PWTrackSignificantLocationChanges - Uses GPS in foreground, Cell Triangulation in background. 
  pushNotification.startLocationTracking('PWTrackSignificantLocationChanges',
                  function() {
                       console.warn('Location Tracking Started');
                  });
}

function registerPushwooshAndroid() {

  var pushNotification = window.plugins.pushNotification;

  //push notifications handler
  document.addEventListener('push-notification', function(event) {
              var title = event.notification.title;
              var userData = event.notification.userdata;

              //dump custom data to the console if it exists
              if(typeof(userData) != "undefined") {
          console.warn('user data: ' + JSON.stringify(userData));
        }

        //and show alert
        navigator.notification.alert(title);

        //stopping geopushes
        pushNotification.stopGeoPushes();
        });

  //trigger pending push notifications
  pushNotification.onDeviceReady();

  //projectid: "GOOGLE_PROJECT_ID", appid : "PUSHWOOSH_APP_ID"
  pushNotification.registerDevice({ projectid: "531619712343", appid : "A19F3-083EA" },
                  function(token) {
                    //alert(token);
                    //callback when pushwoosh is ready
                    onPushwooshAndroidInitialized(token);
                  },
                  function(status) {
                    //alert("failed to register: " +  status);
                      console.warn(JSON.stringify(['failed to register ', status]));
                  });
 }

function onPushwooshAndroidInitialized(pushToken)
{
  //output the token to the console
  console.warn('push token: ' + pushToken);

  var pushNotification = window.plugins.pushNotification;
  
  pushNotification.getTags(function(tags) {
              console.warn('tags for the device: ' + JSON.stringify(tags));
             },
             function(error) {
              console.warn('get tags error: ' + JSON.stringify(error));
             });
   

  //set multi notificaiton mode
  //pushNotification.setMultiNotificationMode();
  //pushNotification.setEnableLED(true);
  
  //set single notification mode
  //pushNotification.setSingleNotificationMode();
  
  //disable sound and vibration
  //pushNotification.setSoundType(1);
  //pushNotification.setVibrateType(1);
  
  pushNotification.setLightScreenOnNotification(false);
  
  //goal with count
  //pushNotification.sendGoalAchieved({goal:'purchase', count:3});
  
  //goal with no count
  //pushNotification.sendGoalAchieved({goal:'registration'});

  //setting list tags
  //pushNotification.setTags({"MyTag":["hello", "world"]});
  
  //settings tags
  pushNotification.setTags({deviceName:"hello", deviceId:10},
                  function(status) {
                    console.warn('setTags success');
                  },
                  function(status) {
                    console.warn('setTags failed');
                  });
    
  function geolocationSuccess(position) {
    pushNotification.sendLocation({lat:position.coords.latitude, lon:position.coords.longitude},
                 function(status) {
                    console.warn('sendLocation success');
                 },
                 function(status) {
                    console.warn('sendLocation failed');
                 });
  };
    
  // onError Callback receives a PositionError object
  //
  function geolocationError(error) {
    //alert('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
  }
  
  function getCurrentPosition() {
    navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationError);
  }
  
  //greedy method to get user position every 3 second. works well for demo.
//  setInterval(getCurrentPosition, 3000);
    
  //this method just gives the position once
//  navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationError);
    
  //this method should track the user position as per Phonegap docs.
//  navigator.geolocation.watchPosition(geolocationSuccess, geolocationError, { maximumAge: 3000, enableHighAccuracy: true });

  //Pushwoosh Android specific method that cares for the battery
  pushNotification.startGeoPushes();
}

 function initPushwoosh() {
  var pushNotification = window.plugins.pushNotification;
  if(device.platform == "Android")
  {
    registerPushwooshAndroid();
    pushNotification.onDeviceReady();
  }

  if(device.platform == "iPhone" || device.platform == "iOS")
  {
    registerPushwooshIOS();
    pushNotification.onDeviceReady();
  }
}