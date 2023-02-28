/*
 * Bootstrap-based responsive mashup
 * @owner Enter you name here (xxx)
 */
/*
 *    Fill in host and port for Qlik engine
 */
var prefix = window.location.pathname.substr( 0, window.location.pathname.toLowerCase().lastIndexOf( "/extensions" ) + 1 );

var config = {
	host: window.location.hostname,
	prefix: prefix,
	port: window.location.port,
	isSecure: window.location.protocol === "https:"
};
//to avoid errors in dev-hub: you can remove this when you have added an app
var app;
var counter=[0,0,0,0,0];
require.config( {
	baseUrl: (config.isSecure ? "https://" : "http://" ) + config.host + (config.port ? ":" + config.port : "" ) + config.prefix + "resources"
} );

function genUUID() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

var currentServiceURL = (config.isSecure ? "https://" : "http://" ) + config.host + (config.port ? ":" + config.port : "" ) + config.prefix;
var stagingServiceURL = 'https://yourStagingServer';
var productionServiceURL = 'https://yourProductionServer';
	
require( ["js/qlik"], function ( qlik ) {
	var control = false;
	var popupctr = false;
	qlik.getAppList = function(callback){
		return qlik.getGlobal().getAppList(callback);
	}
	//console.log('url check', currentServiceURL);
	function createSystemLink() {
		systemName = ['Dev', 'Staging', 'Production'];
		systemBaseURL = [currentServiceURL, stagingServiceURL, productionServiceURL];
		systemToolName = ['HUB', 'Dev-Hub', 'QMC'];
		systemToolURL = ['hub', 'dev-hub', 'qmc'];
		systemToolIcon = ['lui-icon--hub-logo', 'lui-icon--repair', 'lui-icon--cogwheel'];
		//console.log("systemName", systemName);
		systemName.forEach(function(sysName, index, array){
			//console.log("sysName", index, sysName, systemBaseURL[index]);
				syslinktagstr  = '<tr class="content">';
				syslinktagstr += '	<td>'+sysName+'</td>';
			systemToolURL.forEach(function(toolURL, index2, array2){
				//console.log("sysName", index, sysName, systemBaseURL[index] + toolURL);
				qurl = systemBaseURL[index] + toolURL;
				syslinktagstr += '	<td><a href="'+qurl+'" target="_blank" class="lui-icon '+systemToolIcon[index2]+'" aria-hidden="true" title="'+systemToolName[index2]+'"></a></td>';
			});
				syslinktagstr += '</tr>';
				$('#systemLink:last').append(syslinktagstr);
		});
	}

	function toastMsg(msg){
		popUUID = genUUID();
		$( '#popup' ).append("<div id='"+popUUID+"'>"+ msg + "</div>" );
		$( '#'+popUUID ).fadeIn( 1000 ).delay( 10000 ).fadeOut( 1000 );
	}
	$(document).on("click",'#mashupPageLink > .lui-button', function() {
		target = $(this).attr('id');
		$("#mashupPageLink > .lui-button").removeClass("lui-active");
		$(this).addClass("lui-active");
		$("#htmlContents").load( target + '.html', function() {
			if (target == 'sl') {
				createSystemLink();
				createMashupLink();
			} else if (target == 'ch'){
				createCustomHub();
			} else if (target == 'mn'){
				app.getObject('QVFilter','2c6f7874-6f85-4a10-bf78-dee9db2a731a');
				app.getObject('QV05','jPLMsj');
				app.getObject('QV04','rPdEKM');
			} else if (target == 'rp'){
			}
		});
	});
	$(document).on("change",'#selectRepoPath', function() {
		//$('#selectRepoPath').val();
		$("#repoPath").val($('#selectRepoPath').val());
	});
	$(document).on("click",'#searchRepo', function() {
		repoMethod = $('#repoMethod').val();
		repoPath = $('#repoPath').val();
		
		repoResultStr  = 'Method : ' + repoMethod + '\n';
		repoResultStr += 'Repository Path : ' + repoPath + '\n';
		
		qlik.callRepository( repoPath, repoMethod ).success( function ( reply ) {
			//console.log(repoPath, repoMethod, reply);
			//repoResultStr += JSON.stringify(reply, null, "\t");
			$('#repositoryResult').val(repoResultStr + JSON.stringify(reply, null, "\t"));
		});
	});
	$(document).on("keyup",'#searchStream', function() {
		var value = $(this).val().toLowerCase();
		//console.log(value);
		$("#streamlist > .stream").filter(function() {
			$(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
		});
	});
	$(document).on("keyup",'#searchApp', function() {
		var value = $(this).val().toLowerCase();
		$("#applist > .stream").filter(function() {
			$(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
		});
	});
	$(document).on('click','.downloadPublishedApps',function(){
		toastMsg("Download Published apps:  </br>");
		$('#applist > .stream').not('.mywork').each(function (index, item) {
			//console.log(index, $(item).attr("id"));
			appid = $(item).attr("id");
			appName = $(item).find(".appname").text();
			toastMsg("Make a Link " + index +" : "+appName+"  </br>");
			exportApp(appid);
		});
	});
	$(document).on('click','.downloadAllApps',function(){
		toastMsg("Download All apps:  </br>");
		$('#applist > .stream').each(function (index, item) {
			//console.log(index, $(item).attr("id"));
			appid = $(item).attr("id");
			appName = $(item).find(".appname").text();
			toastMsg("Make a Link " + index +" : "+appName+"  </br>");
			exportApp(appid);
		});
	});
	$(document).on('click','.downloadWorkApps',function(){
		toastMsg("Download Work apps:  </br>");
		$('#applist > .mywork').each(function (index, item) {
			//console.log(index, $(item).attr("id"));
			appid = $(item).attr("id");
			appName = $(item).find(".appname").text();
			toastMsg("Make a Link " + index +" : "+appName+"  </br>");
			exportApp(appid);
		});
	});

	//backup selected Stream: download to local
	$(document).on('click','.downloadStreamApps',function(){
		toastMsg("Download stream apps:  </br>"+$(this).parent().find("#selectedStreamName").text());
		$('#applist > .stream').not('.displaynone').each(function (index, item) {
			appid = $(item).attr("id");
			appName = $(item).find(".appname").text();
			toastMsg("Make a Link " + index +" : "+appName+"  </br>");
			exportApp(appid);
		});
	});
	//show apps when click stream
	$(document).on('click','#streamlist > .stream',function(){
		$("#applist > .stream").addClass("displaynone");	//Hide all Appinfo
		$("#applist > .stream."+$(this).attr('id')).toggleClass("displaynone");	//Show Selected Stream Apps
		$("#selectedStreamName").text($(this).find('.streamname').text());	//Change Titile in App Info Area
		$("#taskcnt").text($(this).find('.taskcount').text());
		$("#successcnt").text($(this).find('.successcount').text());
		$("#failcnt").text($(this).find('.failedcount').text());
		$("#othercnt").text($(this).find('.otherscount').text());
		$(".downloadStreamApps").attr('id', $(this).attr('id'));
	})
	
	//App: Make copy
	$(document).on('click','.copyApp',function(){
		toastMsg("App: Make copy </br>"+$(this).parent().parent().find(".appname").text());
		repoPath = '/qrs/app/'+$(this).attr('id')+'/copy';
		qlik.callRepository( repoPath, 'POST' ).success( function ( reply ) {
			toastMsg('App Duplicated: </br><a target="_blank" href="/sense/app/'+reply.id+'">'+reply.name+'</a>');
		});
	})

	//Click event : exportapp
	$(document).on('click','.exportapp',function(){
		//console.log("download 시작", $(this).attr('id'));
		toastMsg("App: Export </br>"+$(this).parent().parent().find(".appname").text());
		$(this).addClass("qv-loader").removeClass("lui-icon--download");
		exportApp($(this).attr('id'));
	})
	//app export
	function exportApp(appID){
		repoPath = '/qrs/app/'+appID+'/export/'+genUUID();
		qlik.callRepository( repoPath, 'POST' ).success( function ( reply ) {
			//console.log(appID + "downloadPath:", reply.downloadPath);
			openUrl(appID, reply.downloadPath);
			$("#"+appID+".exportapp").removeClass("qv-loader").addClass("lui-icon--tick");
			toastMsg("App: Exported </br>"+$(".appinfo#"+appID).find(".appname").text());
		});
	}
	//open download iframe
	function openUrl(appID, srcUrl){
		//window.open(reply.downloadPath, '_blank');
		$("#download").append('<iframe class="displaynone download '+appID+'"></iframe>');
		$(".download."+appID).attr('src', srcUrl);
	}
	
	qlik.setOnError( function ( error ) {
		toastMsg(error.message);
		console.log("error:", error);
		if(error.message==='ProxyError.OnSessionTimedOut' || error.message==='Session timed out due to inactivity'){	//'Session timed out due to inactivity' ==> feb 2021 ==> 'ProxyError.OnSessionTimedOut'
			//alert("Your session has expired and you need to reload the page.");
			location.reload();
		} else {
			//alert("error: " + error.message);
		}
	} );
	var global = qlik.getGlobal(config);
	var authenticatedUser;
	var lastReloadtime;
	global.getAuthenticatedUser(function(reply){
		authenticatedUser = reply.qReturn.split('=')[1].split(';')[0] + "\\" + reply.qReturn.split('=')[2];
		//$( "#authUser" ).html( "("+authenticatedUser+")" );
		toastMsg("Welcome! " + authenticatedUser + "<br>");
		/*$( '#popupText' ).append( "Welcome! " + authenticatedUser + "<br>" );
		if ( !control ) {
			control = true;
			$( '#popup' ).delay( 1000 ).fadeIn( 1000 ).delay( 11000 ).fadeOut( 1000 );
		}*/
	});
	$( "body" ).css( "overflow: hidden;" );
	function AppUi ( app ) {
		var me = this;
		this.app = app;
		app.global.isPersonalMode( function ( reply ) {
			me.isPersonalMode = reply.qReturn;
		} );
		app.getAppLayout( function ( layout ) {
			//$( "#title" ).html( layout.qTitle );
			//$( "#title" ).attr( "title", "Last reload (UTC):" + layout.qLastReloadTime.replace( /T/, ' ' ).replace( /Z/, ' ' ) );
			//TODO: bootstrap tooltip ??
		} );
		app.getList( 'SelectionObject', function ( reply ) {
			$( "[data-qcmd='back']" ).parent().toggleClass( 'disabled', reply.qSelectionObject.qBackCount < 1 );
			$( "[data-qcmd='forward']" ).parent().toggleClass( 'disabled', reply.qSelectionObject.qForwardCount < 1 );
		} );
		app.getList( "BookmarkList", function ( reply ) {
			var str = "";
			reply.qBookmarkList.qItems.forEach( function ( value ) {
				if ( value.qData.title ) {
					str += '<li><a data-id="' + value.qInfo.qId + '">' + value.qData.title + '</a></li>';
				}
			} );
			str += '<li><a data-cmd="create">Create</a></li>';
			$( '#qbmlist' ).html( str ).find( 'a' ).on( 'click', function () {
				var id = $( this ).data( 'id' );
				if ( id ) {
					app.bookmark.apply( id );
				} else {
					var cmd = $( this ).data( 'cmd' );
					if ( cmd === "create" ) {
						$( '#createBmModal' ).modal();
					}
				}
			} );
		} );
		$( "[data-qcmd]" ).on( 'click', function () {
			var $element = $( this );
			switch ( $element.data( 'qcmd' ) ) {
				//app level commands
				case 'clearAll':
					app.clearAll();
					break;
				case 'back':
					app.back();
					break;
				case 'forward':
					app.forward();
					break;
				case 'lockAll':
					app.lockAll();
					break;
				case 'unlockAll':
					app.unlockAll();
					break;
				case 'createBm':
					var title = $( "#bmtitle" ).val(), desc = $( "#bmdesc" ).val();
					app.bookmark.create( title, desc );
					$( '#createBmModal' ).modal( 'hide' );
					break;
			}
		} );
	}
	//qlik.theme.apply('horizon');
	//callbacks -- inserted here --

	function createMashupLink () {
		qlik.callRepository( '/qrs/extension/schema', 'GET' ).success( function ( reply ) {
	//console.log("reply", "Arrary?"+Array.isArray(reply), reply);
	
			mashupArray = Object.values(reply).filter(exts => exts.type === 'mashup');
	//console.log('mashupArray', mashupArray);
			mashupArray.sort(function(a, b) {
				var nameA = a.name.toUpperCase(); // ignore upper and lowercase
				var nameB = b.name.toUpperCase(); // ignore upper and lowercase
				if (nameA < nameB) { return -1; }
				if (nameA > nameB) { return 1; }
				// 이름이 같을 경우
				return 0;
			});	
	//console.log('sorted', mashupArray);
			systemBaseURL = [currentServiceURL + 'extensions/', stagingServiceURL + 'extensions/', productionServiceURL + 'extensions/'];

			mashupArray.forEach(function(mashups, index, array) {
				var existMashup;
				systemBaseURL.forEach(function(sysURL, index, array){

				});
	//console.log(mashups.name);
	//console.log("systemBaseURL", index, sysURL+mashups.name+'/'+mashups.name+'.html');
				mashupLinkStr  = '	<tr class="content">';
				mashupLinkStr += '		<td class="mashupName">'+ index + '. ' + mashups.name +'</td>';
				mashupLinkStr += '		<td><a href="'+currentServiceURL+'dev-hub/mashup-editor/#qext{'+mashups.name+'}" target="_blank" class="lui-fade-button__icon lui-button--rounded  lui-button--success">Edit</a>';

				mashupLinkStr += '			<a href="'+systemBaseURL[0]+mashups.name+'/'+mashups.name+'.html" target="_blank" class="lui-fade-button__icon lui-button--rounded  lui-button--info">Go</a></td>';
				mashupLinkStr += '		<td><a href="'+systemBaseURL[1]+mashups.name+'/'+mashups.name+'.html" target="_blank" class="lui-fade-button__icon lui-button--rounded  lui-button--warning">Go</a></td>';
				mashupLinkStr += '		<td><a href="'+systemBaseURL[2]+mashups.name+'/'+mashups.name+'.html" target="_blank" class="lui-fade-button__icon lui-button--rounded  lui-button--danger">Not</a></td>';
				mashupLinkStr += '	</tr>';

				/*mashupLinkStr  = '	<div class="mashuplink">';
				mashupLinkStr += '		<span>' + mashups.name + '</span>';
				mashupLinkStr += '		<span class="lui-icon lui-icon--edit" id="' + systemBaseURL[0]+mashups.name+'/'+mashups.name+'.html"></span>';
				mashupLinkStr += '		<span class="lui-icon lui-icon--play lui-fade-button--success" id="' + systemBaseURL[0]+mashups.name+'/'+mashups.name+'.html"></span>';
				mashupLinkStr += '		<span class="lui-icon lui-icon--play lui-fade-button--warning" id="' + systemBaseURL[1]+mashups.name+'/'+mashups.name+'.html"></span>';
				mashupLinkStr += '		<span class="lui-icon lui-icon--play lui-fade-button--danger" id="' + systemBaseURL[2]+mashups.name+'/'+mashups.name+'.html"></span>';
				mashupLinkStr += '	</div>';*/

				$('#mashupArea:last').append(mashupLinkStr);

			});

		});
	}
	function createCustomHub ()  {
		repoPath = '/qrs/app/full';
		qlik.callRepository( repoPath, 'GET' ).success( function ( reply ) {
			counter[0] = reply.length;
			reply.sort(function(a, b) {
				var nameA = a.name.toUpperCase(); // ignore upper and lowercase
				var nameB = b.name.toUpperCase(); // ignore upper and lowercase
				if (nameA < nameB) { return -1; }
				if (nameA > nameB) { return 1; }
				return 0;// 이름이 같을 경우
			});
	//console.log("app sorting ", reply);
			reply.forEach(function(apps) {
				var appId = apps.id;
				var appName= apps.name;
				var ownerId = apps.owner.userId;
				var lastReloadTime = apps.lastReloadTime;
				var streamId;
				var streamName;
				if(apps.published) {
					streamId = apps.stream.id;
					streamName = apps.stream.name;
				} else {
					streamId = 'mywork';
					streamName = 'mywork';
				}
					streamstr='';
				if($("#streamlist > .stream").hasClass(streamId) === false) { 
					streamstr +='<div class="col-xs-4 col-sm-3 col-md-2 stream '+ streamId +'" id="'+ streamId +'">';
					streamstr +='	<div class="streaminfo '+ streamId + '">';
					streamstr +='		<div class="streamname">'+ streamName +' (<span class="appcount '+ streamId + '">0</span>)</div>';
					streamstr +='		<div class="streamdetail">';
					streamstr +='			<div>Task: <span class="taskcount '+ streamId + '">0</span>';
					streamstr +='				 Success: <span class="successcount '+ streamId + '">0</span></div>';
					streamstr +='			<div>Failed: <span class="failedcount '+ streamId + '">0</span>';
					streamstr +='				 Others: <span class="otherscount '+ streamId + '">0</span></div>';
					streamstr +='		</div>';
					streamstr +='	</div>';
					streamstr +='</div>';
					$('#streamlist:last').append(streamstr);
				}
				
					appstr = '';
					appstr +='	<div class="col-xs-6 col-sm-4 col-md-3 displaynone appinfo '+appId+' stream '+ streamId +'" id="'+appId+'">';
					appstr +='		<div class="appname"><a href="/sense/app/'+appId+'" target="_blank">'+appName+'</a></div>';
					appstr +='		<div class="appdesc apptools">';
					appstr +='			<span id="'+ appId +'" title="App Export" class="lui-icon lui-icon--download exportapp"></span>';
					appstr +='			<span id="'+ appId +'" title="App Copy" class="lui-icon lui-icon--copy copyApp"></span>';
					appstr +='		</div>';
					appstr +='		<div class="appdesc owner">owner: '+ownerId+'</div>';
					appstr +='		<div class="appdesc ReloadTime">LastReload: '+lastReloadTime+'</div>';
					appstr +='	</div>';

					$('#applist:last').append(appstr);

				$(".appcount."+ streamId).text(Number($(".appcount."+ streamId).text()) + 1);


			});	//end reply.forEach
			//sortUsingNestedText('#streamlist', 'div', '#streamlist > .stream > .streaminfo > .streamname');

			//App List for Init Loading
			//$("#selectedStreamName").text($("#streamlist > .stream.20e27d5b-b9ed-42d6-b5fc-f0453e6a8039").find('.streamname').text());
			//$("#applist > .stream.20e27d5b-b9ed-42d6-b5fc-f0453e6a8039").toggleClass("displaynone");

			/* Insert Task Last Execution Result */
			repoPath = '/qrs/task/full';
			qlik.callRepository( repoPath, 'GET' ).success( function ( tasklist ) {
				counter[1] = tasklist.length;	//task count
				let taskResultName = ['Never started', 'Triggered', 'Started', 'Queued', 'Abort initiated', 'Aborting', 'Aborted', 'Success', 'Failed', 'Skipped', 'Retrying', 'Error', 'Reset'];
				let taskResultColor = ['#ff9800', '#ff9800', '#ff9800', '#ff9800', '#ff9800', '#ff9800', '#ff9800', '#00C853', '#D50000', '#ff9800', '#ff9800', '#ff9800', '#ff9800'];
	//console.log(repoPath, tasklist );
				tasklist.forEach(function(tasks) {
					var appId = tasks.app.id;
					var taskId = tasks.id;
					var taskName = tasks.name;
					var lastExecutionResult = tasks.operational.lastExecutionResult.status;
					var streamId = (tasks.app.published ? tasks.app.stream.id : 'mywork');
	//console.log("streamId", streamId, "appId:", appId, "taskId:", taskId, "taskName:", taskName, "lastExecutionResult:", lastExecutionResult);
					$(".taskcount."+ streamId).text(Number($(".taskcount."+ streamId).text()) + 1);
					tagstr = '<div class="appdesc executionResult '+taskId+'"> '+tasks.name+' : '+taskResultName[lastExecutionResult]+' </div>';
					$('.appinfo.'+appId+' > .appname').after(tagstr);
					$('.appdesc.executionResult.'+taskId).css('color', taskResultColor[lastExecutionResult]);
	//$('.appdesc.executionResult.'+taskId).addClass("tasketc");

					if(lastExecutionResult==7){	//success
						$(".successcount."+ streamId).text(Number($(".successcount."+ streamId).text()) + 1);
						counter[2] = counter[2] + 1;
					} else if(lastExecutionResult==8){	//failed
						$(".failedcount."+ streamId).text(Number($(".failedcount."+ streamId).text()) + 1);
						$('.appinfo.'+appId).css('border-color', taskResultColor[lastExecutionResult]);
						$(".failedcount."+ streamId).addClass("taskerror");
						$("#streamlist > #"+ streamId).addClass("taskerrorborder");
						counter[3] = counter[3] + 1;
						$("#applist > .appinfo."+appId).insertBefore("#applist > .appinfo:first");
						$("#streamlist > .stream."+streamId).insertBefore("#streamlist > .stream:first");
					} else {
						$(".otherscount."+ streamId).text(Number($(".otherscount."+ streamId).text()) + 1);
						$('.appinfo.'+appId).css('border-color', taskResultColor[lastExecutionResult]);
						$(".otherscount."+ streamId).addClass("tasketc");
						$("#streamlist > .stream."+streamId).insertBefore("#streamlist > .stream:first");
						$("#applist > .appinfo."+appId).insertBefore("#applist > .appinfo:first");
						$("#streamlist > #"+ streamId).addClass("taskothersborder");
						counter[4] = counter[4] + 1;
					}
				});		//end tasklist.forEach
				letcounters();
			} );	//end callRepository
		});	//end callRepository

		function letcounters(){
			tagstr = '(Apps: '+counter[0]+', Tasks: '+counter[1]+', Success: '+counter[2]+', Failed: '+counter[3]+', Others: '+counter[4]+')';
			$(".counters").text(tagstr);
		}
	}

	function sortUsingNestedText(parent, childSelector, keySelector) {
		var items = parent.children(childSelector).sort(function(a, b) {
			var vA = $(keySelector, a).text();
			var vB = $(keySelector, b).text();
			return (vA < vB) ? -1 : (vA > vB) ? 1 : 0;
		});
		parent.append(items);
	}

	//open apps -- inserted here --
	var app = qlik.openApp('', config);
	app.bookmark.apply('');
	qlik.theme.apply('horizon');
	//get objects -- inserted here --



	if ( app ) {
		new AppUi( app );
	}
	
	//initial loading page
	$("#htmlContents").load( 'sl.html', function() {
		createSystemLink();
		createMashupLink ();
	});
	
} );
