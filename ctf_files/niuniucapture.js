var emPensize=1,emDrawType=2,emTrackColor=3,emEditBorderColor=4,emTransparent=5,emWindowAware=6,emSetSaveName=8,emSetMagnifierBkColor=9,emSetMagnifierLogoText=10,emSetWatermarkPictureType=20,emSetWatermarkPicturePath=21,emSetWatermarkTextType=22,emSetWatermarkTextValue=23,emSetMosaicType=24,emSetTooltipText=25,emSetMoreInfo=26,emClosed=1,emConnected=2,emConnecting=3,emCaptureSuccess=0,emCaptureFailed=1,emCaptureUnknown=2,emCmdReady=-1,emCmdCapture=0,emCmdSaveFile=1;function isMacintosh(){return navigator.platform.indexOf("Mac")>-1}function rgb2value(e,t,n){return e|t<<8|n<<16}var captureObjSelf=null;function onpluginLoaded(){captureObjSelf.pluginLoaded(!1)}function NiuniuCaptureObject(){var self=this;captureObjSelf=this,this.PenSize=2,this.DrawType=0,this.TrackColor=rgb2value(255,0,0),this.EditBorderColor=rgb2value(255,0,0),this.Transparent=240,this.WindowAware=1,this.MosaicType=1,this.SaveName="测试保存",this.MagnifierLogoText="测试截图",this.WatermarkPictureType="2|100|100|400|400|20",this.WatermarkPicturePath="",this.WatermarkTextType="2|100|100|100|40|20|0|150|30|80,55,55,55",this.WatermarkTextValue="",this.NiuniuAuthKey="",this.ToolTipText="",this.MoreInfo="1,100|300|600",this.useCustomizedProtoco=!0,this.IsWaitCustomizedCallBack=!1,this.autoConnectAfterPageLoad=!0,this.IsFirstConnect=!0,this.IsEverConnected=!1,this.reconnectTryTime=0,this.TimeIntervalID=-1,this.ReceivedEchoBack=!1,this.Version="1.0.0.0",this.hostPort="30101,30102",this.hostPortIndex=0,this.CaptureName="NiuniuCapture",this.NiuniuSocket=null,this.connectState=emClosed,this.SocketTimeStamp=(new Date).getTime(),this.TimeOutID=-1,this.FinishedCallback=null,this.PluginLoadedCallback=null,this.VersionCallback=null,this.OnConnectFailed=function(e){},this.LoadPlugin=function(){var e=document.getElementById("capturecontainer");if(!e){var t=document.createElement("div");t.id="capturecontainer",t.style.width="0px",t.style.height="0px",document.body.appendChild(t),e=document.getElementById("capturecontainer")}if(e.innerHTML="",e.innerHTML='<object id="niuniuCapture" type="application/x-niuniuwebcapture" width="0" height="0"><param name="onload" value="onpluginLoaded" /></object>',!document.getElementById("startCaptureFrame")){var n=document.createElement("iframe");n.id="startCaptureFrame",n.style.display="none",document.body.appendChild(n)}},this.niuniuCapture=function(){return document.getElementById("niuniuCapture")},this.addEvent=function(e,t,n){e.attachEvent?e.attachEvent("on"+t,n):e.addEventListener(t,n,!1)},this.pluginValid=function(){try{if(self.niuniuCapture().valid)return!0}catch(e){}return!1},this.OnCaptureFinished=function(e,t,n,i,a,r){self.OnCaptureFinishedEx(1,e,t,n,i,"",a,r)},this.OnCaptureFinishedEx=function(e,t,n,i,a,r,s,o){null!=self.FinishedCallback?self.FinishedCallback(e,t,n,i,a,r,s,o):alert("截图完成的事件未绑定，将不能对图片进行处理，请指定FinishedCallback回调函数")},this.pluginLoaded=function(e){return e||self.pluginValid()?(self.GetVersion(),null!=self.PluginLoadedCallback&&self.PluginLoadedCallback(!0),!!self.pluginValid()&&(self.niuniuCapture().InitCapture(self.NiuniuAuthKey),self.niuniuCapture().InitParam(emPensize,self.PenSize),self.niuniuCapture().InitParam(emDrawType,self.DrawType),self.niuniuCapture().InitParam(emTrackColor,self.TrackColor),self.niuniuCapture().InitParam(emEditBorderColor,self.EditBorderColor),self.niuniuCapture().InitParam(emTransparent,self.Transparent),self.niuniuCapture().InitParam(emSetSaveName,self.SaveName),self.niuniuCapture().InitParam(emSetMagnifierLogoText,self.MagnifierLogoText),self.niuniuCapture().InitParam(emSetMosaicType,self.MosaicType),self.niuniuCapture().InitParam(emSetTooltipText,self.ToolTipText),self.niuniuCapture().InitParam(emSetMoreInfo,self.MoreInfo),self.addEvent(self.niuniuCapture(),"CaptureFinishedEx",self.OnCaptureFinishedEx),void self.addEvent(self.niuniuCapture(),"CaptureFinished",self.OnCaptureFinished))):(null!=self.PluginLoadedCallback&&self.PluginLoadedCallback(!1),!1)},this.SetWatermarkPicture=function(e){self.WatermarkPicturePath=e,self.pluginValid()&&(self.niuniuCapture().InitParam(emSetWatermarkPicturePath,self.WatermarkPicturePath),self.niuniuCapture().InitParam(emSetWatermarkPictureType,self.WatermarkPictureType))},this.SetWatermarkText=function(e){self.WatermarkTextValue=e,self.pluginValid()&&(self.niuniuCapture().InitParam(emSetWatermarkTextValue,self.WatermarkTextValue),self.niuniuCapture().InitParam(emSetWatermarkTextType,self.WatermarkTextType))},this.SavePicture=function(e){self.pluginValid()&&self.niuniuCapture().SavePicture(e)},this.GetCursorPosition=function(){return self.pluginValid()?self.niuniuCapture().GetCursorPosition():""},this.NewCaptureParamObject=function(e,t,n,i,a,r,s){var o=new Object;return o.CmdType=1,o.IsGBK=0,o.AuthKey=self.NiuniuAuthKey,o.Pensize=self.PenSize,o.DrawType=self.DrawType,o.TrackColor=self.TrackColor,o.EditBorderColor=self.EditBorderColor,o.Transparent=self.Transparent,o.SetSaveName=self.SaveName,o.SetMagnifierLogoText=self.MagnifierLogoText,o.SetWatermarkPictureTypeEx=self.WatermarkPictureType,o.SetWatermarkPicturePath=self.WatermarkPicturePath,o.SetWatermarkTextTypeEx=self.WatermarkTextType,o.SetWatermarkTextValue=self.WatermarkTextValue,o.MosaicType=self.MosaicType,o.SetToolbarText=self.ToolTipText,o.MoreInfo=this.MoreInfo,o.DefaultPath=e,o.HideCurrentWindow=t,o.AutoCaptureFlag=n,o.x=i,o.y=a,o.Width=r,o.Height=s,o},this.DoCapture=function(e,t,n,i,a,r,s){return self.IsNeedCustomizedProtocol()?self.DoCaptureForCustomize(e,t,n,parseInt(i),parseInt(a),parseInt(r),parseInt(s)):self.pluginValid()?(self.niuniuCapture().Capture(e,t,n,i,a,r,s),emCaptureSuccess):emCaptureFailed},this.InitNiuniuCapture=function(){self.LoadPlugin(),setTimeout("captureObjSelf.InitWebSocketAndBindCallback();",200)},this.InitWebSocketAndBindCallback=function(){self.autoConnectAfterPageLoad&&self.IsNeedCustomizedProtocol()&&self.connectHost()},this.getNextPort=function(){var e=self.hostPort.split(",");if(e.length<1)return alert("服务端口为空"),30101;self.hostPortIndex<0&&(self.hostPortIndex=0),self.hostPortIndex>e.length-1&&(self.hostPortIndex=e.length-1);var t=parseInt(e[self.hostPortIndex]);return self.hostPortIndex++,self.hostPortIndex>e.length-1&&(self.hostPortIndex=0),t},this.connectHost=function(){if(null==self.NiuniuSocket){clearTimeout(self.TimeOutID),self.connectState=emConnecting;try{var wshosts=["127.0.0.1","localhost"];for(var i in wshosts)try{var host="ws://127.0.0.1:"+self.getNextPort()+"/"+self.CaptureName;self.NiuniuSocket=new WebSocket(host);break}catch(e){var ggg=0}self.NiuniuSocket.onopen=function(e){self.NiuniuSocket.send("0"+self.SocketTimeStamp),clearTimeout(self.TimeOutID)},self.NiuniuSocket.onmessage=function(msg){var str="";str=msg.data;var id=str.substr(0,1),arg1=str.substr(1);if(clearTimeout(self.TimeOutID),"0"==id&&(self.hostPortIndex--,self.connectState=emConnected,self.pluginLoaded(!0),self.IsEverConnected=!0,self.IsFirstConnect=!1,self.IsWaitCustomizedCallBack&&setTimeout("captureObjSelf.SendReadyRecvData();",3),self.ReceivedEchoBack=!0,clearInterval(self.TimeIntervalID),self.TimeIntervalID=setInterval("captureObjSelf.LoopEchoMessage()",3e3)),"1"==id){var _aoResult=eval("("+arg1+")");if(self.ReceivedEchoBack=!0,"echo"==_aoResult.command)return;"version"==_aoResult.command?self.VersionCallback(_aoResult.Ver):self.OnCaptureFinishedEx(_aoResult.Type,_aoResult.x,_aoResult.y,_aoResult.Width,_aoResult.Height,_aoResult.Info,_aoResult.Content,_aoResult.LocalPath)}},self.NiuniuSocket.onclose=function(e){self.OnWebSocketError("self.NiuniuSocket.onclose."+e.data)},self.NiuniuSocket.onerror=function(e){}}catch(e){self.OnWebSocketError("connect exception."+e.message)}}},this.WriteLog=function(e){try{console.log(e)}catch(e){}},this.OnWebSocketError=function(e){var t=!1;if(self.connectState!=emConnected&&(t=!0),self.ReceivedEchoBack=!1,self.connectState=emClosed,null!=self.NiuniuSocket&&self.NiuniuSocket.close(),self.NiuniuSocket=null,clearTimeout(self.TimeOutID),clearInterval(self.TimeIntervalID),t){if(self.IsFirstConnect)return self.IsFirstConnect=!1,void(null!=self.OnConnectFailed&&self.OnConnectFailed(!1));if(self.IsEverConnected&&(self.reconnectTryTime++,self.reconnectTryTime>3))return self.IsEverConnected=!1,self.reconnectTryTime=0,void(null!=self.OnConnectFailed&&self.OnConnectFailed(!0))}self.TimeOutID=setTimeout("captureObjSelf.connectHost();",800)},this.LoopEchoMessage=function(){if(!self.ReceivedEchoBack)return self.OnWebSocketError("this.LoopEchoMessage, !self.ReceivedEchoBack"),self.ReceivedEchoBack=!1,clearInterval(self.TimeIntervalID),void(self.TimeIntervalID=setInterval("captureObjSelf.LoopEchoMessage()",3e3));if(self.ReceivedEchoBack=!1,clearTimeout(self.TimeOutID),self.connectState==emConnected){var e=new Object;e.command="echo",self.NiuniuSocket.send("1"+encodeURIComponent(JSON.stringify(e)))}else clearInterval(self.TimeIntervalID)},this.SendReadyRecvData=function(){var e=self.NewCaptureParamObject("",0,0,0,0,0,0);e.CmdType=-1,self.NiuniuSocket.send("1"+encodeURIComponent(JSON.stringify(e)))},this.DoCaptureForCustomize=function(e,t,n,i,a,r,s){var o=self.NewCaptureParamObject(e,t,n,i,a,r,s);try{if(self.connectState!=emConnected){o.SetWatermarkPicturePath="",u=JSON.stringify(o);var l=self.CaptureName+"://"+encodeURIComponent(u);return document.getElementById("startCaptureFrame").setAttribute("src",l),self.IsWaitCustomizedCallBack=!0,self.connectHost(),emCaptureUnknown}var u=JSON.stringify(o);return self.NiuniuSocket.send("1"+encodeURIComponent(u)),emCaptureSuccess}catch(e){alert(e.message)}return emCaptureUnknown},this.IsNeedCustomizedProtocol=function(){if(isMacintosh())return!0;if(!self.useCustomizedProtoco)return!1;if(self.pluginValid())return!1;try{var e=window.navigator.userAgent.toLowerCase();return!(e.indexOf("compatible")>-1&&e.indexOf("msie")>-1)&&(!(e.indexOf("trident")>-1&&e.indexOf("rv:11.0")>-1)&&(e.indexOf("qqbrowser"),!(-1!=e.indexOf("ubrowser")||-1==e.indexOf("firefox")&&-1==e.indexOf("edge")&&-1==e.indexOf("chrome"))))}catch(e){}return!0},this.GetVersion=function(){if(self.IsNeedCustomizedProtocol()){if(self.connectState!=emConnected)return;var e=new Object;return e.command="version",void self.NiuniuSocket.send("1"+encodeURIComponent(JSON.stringify(e)))}if(self.pluginValid()){var t=self.niuniuCapture().GetVersion();self.VersionCallback(t)}}}