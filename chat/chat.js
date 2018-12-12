(function (){

    var context = SP.ClientContext.get_current();
    var siteUrl = _spPageContextInfo.siteAbsoluteUrl;
    var ListId = _spPageContextInfo.pageListId;
    var ItemId = GetUrlKeyValue('ID', false);
    var listName = "ITChat";
   	var $itchat = $("#itchat");
   	var to_global = [];
   	var max_id = -1;
    
    try {
       $("button", $itchat).click(function() {
            var Message = $("textarea", $itchat).text();
       		AddMessage(Message);
       		return false;
       });
       
       PopulateMessages();
       
    
    }
    catch (e) {
        $("#test").html($("#test").html() + ", error=" + e.message);
    }
    
    $(document).ready(function () {
    });
    
    function AddMessage(Message){
        var itemProperties = {"Title": "-", "ListId": ListId, "ItemId": ItemId, "Message": Message};
        createListItem(siteUrl, listName, itemProperties, 
        	function success() { 
        	    var web = context.get_web();
				var user = web.get_currentUser();
				context.load(user);
				context.executeQueryAsync(
					function(){ 
						//AppendMessageToDiv(new Date(), user.get_title(), Message);  
						$("textarea", $itchat).empty(); 
						
						var i = to_global.indexOf(user.get_email());
						var to = to_global;
						
						if (i >= 0) {
							to.splice(i, 1);
						}
						
						if (to.length > 0) {
							sendEmail(user.get_email(), to, Message, "Сообщение");
						}
						
					}, 
					function(){ $("#test", $itchat).html("Error of getting user!"); }
				);
        	}, 
        	function failture() {
        		$("#test", $itchat).html("Adding message to chat failture!");
        	}
        );
    };
    
    function PopulateMessages() {
    	retriveListItems(siteUrl, listName, ListId, ItemId);
    }
    
	function createListItem(siteUrl, listName, itemProperties, success, failture) {
	
	    var itemType = getItemTypeForListName(listName);
	    itemProperties["__metadata"] = { "type": itemType };
	
	    $.ajax({
	        url: siteUrl + "/_api/web/lists/getbytitle('" + listName + "')/items",
	        type: "POST",
	        contentType: "application/json;odata=verbose",
	        data: JSON.stringify(itemProperties),
	        headers: {
	            "Accept": "application/json;odata=verbose",
	            "X-RequestDigest": $("#__REQUESTDIGEST").val()
	        },
	        success: function (data) {
	            success(data.d);
	        },
	        error: function (data) {
	            failture(data);
	        }
	    });
	}
	
	function retriveListItems(siteUrl, listName, ListId, ItemId)
	{  
	    $.ajax  
	    ({  
	        url: siteUrl + "/_api/web/lists/getbytitle('" + listName + "')/items?$select=ID,ListId,ItemId,AuthorId,Author/EMail,Author/Name,Author/Title,EditorId,Created,Modified,Message&$filter=(ItemId eq " + ItemId + ") and (ListId eq '" + ListId + "')&$expand=Author&$orderby=Modified asc",  
	        type: "GET",  
	        data: {},  
	        headers:  
	        {  
	            "Accept": "application/json;odata=verbose",  
	            "Content-Type": "application/json;odata=verbose",  
	            "X-RequestDigest": $("#__REQUESTDIGEST").val(),  
	            "IF-MATCH": "*",  
	            "X-HTTP-Method": null  
	        },  
	        cache: false,  
	        success: function(data) {
	        
	            $("#messages", $itchat).empty();  
	            to_global = [];
	            max_id = -1;
	            
	            for (var i = 0; i < data.d.results.length; i++)   
	            {  
	                var item = data.d.results[i];
	                
	                if (  to_global.indexOf(item.Author.EMail) < 0 && item.Author.EMail !== null) {
	                	to_global.push(item.Author.EMail);
	                }
	                
	                if (item.ID > max_id) {
	                    max_id = item.ID;
	                }
	                
	                AppendMessageToDiv(new Date(item.Created), item.Author.Title, item.Message);
	            }
	            
			   setTimeout(function() { retriveNewListItems(siteUrl, listName, ListId, ItemId); }, 2000);
	            
	        },  
	        error: function(data) {  
	            $("#messages", $itchat).empty().text(data.responseJSON.error);  
	        }  
	    });  
	} 
	
	function retriveNewListItems(siteUrl, listName, ListId, ItemId)  
	{  
	    $.ajax  
	    ({  
	        url: siteUrl + "/_api/web/lists/getbytitle('" + listName + "')/items?$select=ID,ListId,ItemId,AuthorId,Author/EMail,Author/Name,Author/Title,EditorId,Created,Modified,Message&$filter=(ItemId eq " + ItemId + ") and (ListId eq '" + ListId + "') and (Id gt " + max_id + ")&$expand=Author&$orderby=Modified asc",  
	        type: "GET",  
	        data: {},  
	        headers:  
	        {  
	            "Accept": "application/json;odata=verbose",  
	            "Content-Type": "application/json;odata=verbose",  
	            "X-RequestDigest": $("#__REQUESTDIGEST").val(),  
	            "IF-MATCH": "*",  
	            "X-HTTP-Method": null  
	        },  
	        cache: false,  
	        success: function(data) {  
	            for (var i = 0; i < data.d.results.length; i++)   
	            {  
	                var item = data.d.results[i];
	                
	                if (  to_global.indexOf(item.Author.EMail) < 0 && item.Author.EMail !== null) {
	                	to_global.push(item.Author.EMail);
	                }
	                
	                if (item.ID > max_id) {
	                    max_id = item.ID;
	                }
	                
	                AppendMessageToDiv(new Date(item.Created), item.Author.Title, item.Message);
	            }  
	            
			   setTimeout(function() { retriveNewListItems(siteUrl, listName, ListId, ItemId); }, 2000);
	            
	        },  
	        error: function(data) {  
	            $("#messages", $itchat).empty().text(data.responseJSON.error);  
	        }  
	    });  
	} 
	
	function sendEmail(from, to, body, subject) {
	    var urlTemplate = siteUrl + "/_api/SP.Utilities.Utility.SendEmail";
	    $.ajax({
	        contentType: 'application/json',
	        url: urlTemplate,
	        type: 'POST',
	        data: JSON.stringify({
	            'properties': {
	                '__metadata': { 'type': 'SP.Utilities.EmailProperties' },
	                'From': from,
	                'To': { 'results': to },
	                'Subject': subject,
	                'Body': body
	            }
	        }
	      ),
	        headers: {
	            "Accept": "application/json;odata=verbose",
	            "content-type": "application/json;odata=verbose",
	            "X-RequestDigest": $("#__REQUESTDIGEST").val()
	        },
	        success: function (data) {
	            var result = data.d.results;
	            var i = result.length;
	        },
	        error: function (err) {
	        	$("#messages", $itchat).empty().text(JSON.stringify(err)); 
	        }
	    });
	} 	
	
    function AppendMessageToDiv(date, author, message){
        var html = "<div><span class='date'>" + formatDate(date) + "</span> <span class='author'>" + author + "</span></div>";
        html += "<div class='message'>" + message + "</div>";
        html += "</br>";
        $("#messages").append(html);  
    }	
	
	// Get List Item Type metadata
	function getItemTypeForListName(name) {
	    return "SP.Data." + name.charAt(0).toUpperCase() + name.split(" ").join("").slice(1) + "ListItem";
	}    
	
	function formatDate(date) {
		var hours = date.getHours();
		var minutes = date.getMinutes();
		var minutes = minutes < 10 ? '0' + minutes : minutes;
		var strTime = hours + ':' + minutes;
		return date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear() + "  " + strTime;
	}    

})();
