var pdf = require('html-pdf');
var html = `<html>
	    <head><title>PDF</title></head>
	    <body style="padding:50px;">
	        <p>Hello <br><br>                                                

	        You have just received a referral from. <br><br>

	        Thank you</p>
	    </body>
	</html>`;
var options = { format: 'Letter' };
pdf.create(html, options).toFile('./businesscard.pdf', function(err, res) {
  if (err) return console.log(err);
  console.log(res);
});
