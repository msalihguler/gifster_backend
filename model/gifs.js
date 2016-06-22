var mongoose = require("mongoose");
mongoose.connect('mongodb://gifster:gifster@ds021434.mlab.com:21434/gifster');

var mongoSchema =   mongoose.Schema;

var gifs = {
	"userid":String,
  "gif_urls":String
}
module.exports = mongoose.model('gifs',gifs);
