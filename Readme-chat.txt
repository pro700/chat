Подключение чата к набору документов SharePoint

1) Создать на сайте список ITChat (ListId - Single Line Text, ItemId - Number, Message - Multiple Lines Text)
2) Создать в SharePoint Designer папку itinua, и подпапку chat и записать файлы:
       /itinua/jquery-1.9.1.js
       /itinua/sendmail.jpg
       /itinua/chat/chat.css
       /itinua/chat/chat.js
3) поместить на docsethomepage.aspx вебчасть ContentEditorWebPart и записать содержимое:

<script src="/itinua/jquery-1.9.1.js" type="text/javascript"></script> 
<script src="/_layouts/15/init.js" type="text/javascript"></script> 
<script src="/_layouts/15/core.js" type="text/javascript"></script> 
<script src="/_layouts/15/MicrosoftAjax.js" type="text/javascript"></script> 
<script src="/_layouts/15/sp.core.js" type="text/javascript"></script> 
<script src="/_layouts/15/sp.runtime.js" type="text/javascript"></script> 
<script src="/_layouts/15/sp.js" type="text/javascript"></script>
<link rel="stylesheet" type="text/css" href="/itinua/chat/chat.css">

<div id="itchat">

	<div id="messages">
	</div>
	
	<p>Введите сообщение:</p>
	
	<textarea class="MessageBox" name="Message" cols="80" rows="5">
	</textarea>
	
	<button id="sendmail">
		<img src="/itinua/sendmail.jpg" height="70px" width="70px">
	</button>
	
</div>

<script src="/itinua/chat/chat.js" type="text/javascript"></script>
                