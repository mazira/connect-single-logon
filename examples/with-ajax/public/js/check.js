$(document).ready(function() {
  function checkLoginOrRedirect() {
    $.ajax({
      type: 'POST',
      url: '/api/checklogin',
      success: function(data) {
        if (data.logged_in)
          window.setTimeout(checkLoginOrRedirect, 5000);
        else
          window.location.href = "/"
      }});
  }

  window.setTimeout(checkLoginOrRedirect, 5000);
});
