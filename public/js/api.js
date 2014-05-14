/*
	api file for the other js file in the web
*/
// to do the logout function
function logout()
{
	window.location = "/logout";
}

/*
	By W3 school, to get a cookie by its name field
*/
function getCookie(cname)
{
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i=0; i < ca.length; i++) 
	{
		var c = ca[i].trim();
		if (c.indexOf(name)==0) return c.substring(name.length,c.length);
	}
	return "";
}
