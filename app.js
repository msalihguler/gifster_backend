var express = require("express");
var request = require("request");
var app = express();
var http = require('http').Server(app);
var bodyParser  =   require("body-parser");
var gifsaving     =   require("./model/gifs");
var users     =   require("./model/users");
var messages  = require("./model/messages");
var reveals  = require("./model/reveals");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({"extended" : false}));


app.get("/getgifs",function(req,res){
    var person_id = req.query.id;
    gifsaving.findOne({"userid":person_id},function(err,data){
        if(err){
        response = {"error" : true,"message" : "Error fetching data"};
        res.send(JSON.stringify(response));
        }else{
        if(data){
        var tempString = data.gif_urls;
        res.send(tempString);
        }else{
         var tempString = "{urlist:[]}";
         res.send(tempString);
        }
        }
    });

});
app.get("/deletegif",function(req,res){
    var person_id = req.query.id;
    var url = req.query.url;
    gifsaving.findOne({"userid":person_id},function(err,data){
        if(err){
          response = {"error" : true,"message" : "Error fetching data"};
          res.send(JSON.stringify(response));
        }else{
          var tempString = data.gif_urls;
          var tempArray = JSON.parse(tempString);
          var index =tempArray["urlist"].indexOf(url);
          if(index != -1)
              tempArray["urlist"].splice(index,1);
          data.gif_urls=JSON.stringify(tempArray);
          data.save(function(err,user){
              if(err) {
                response = {"error" : true,"message" : "Error adding data"};
              } else {
                response = {"error" : false,"message" : "Deleted from GIFBoard"};
              }
              res.send(JSON.stringify(response));
          });
        }
    });
});
app.post("/savegif",function(req,res){
    var gif_url = req.query.gifurl;
    var person_id = req.query.id;
    var response={};
    gifsaving.findOne({"userid":person_id},function(err,data){
              if(err) {
                  response = {"error" : true,"message" : "Error fetching data"};
                  res.send(JSON.stringify(response));
              } else {
                if(data){
                  var tempString = data.gif_urls;
                  var tempArray = JSON.parse(tempString);

                  if(tempArray["urlist"].indexOf(gif_url)>-1){
                    response = {"error" : true,"message" : "Already on your list!"};
                    res.send(JSON.stringify(response));
                  }else{
                    tempArray["urlist"].push(gif_url);
                    data.gif_urls=JSON.stringify(tempArray);
                    data.save(function(err,user){
                        if(err) {
                            response = {"error" : true,"message" : "Error adding data"};
                        } else {
                          console.log("saved");
                            response = {"error" : false,"message" : "Added to keyboard"};
                        }
                        res.send(JSON.stringify(response));
                    });
                  }
                }else{
                  var db = new gifsaving();
                  var tempArray = {"urlist":[]};
                  tempArray["urlist"].push(gif_url);
                  console.log("notexist");
                  db.gif_urls=JSON.stringify(tempArray);
                  db.userid = person_id;
                  db.save(function(err,user){
                      if(err) {
                        response = {"error" : true,"message" : "Error adding data"};
                      } else {
                        console.log("saved");
                        response = {"error" : false,"message" : "Added to keyboard"};
                      }
                      res.send(JSON.stringify(response));
                  });
                }
              }
          });
});
app.post("/registeruser",function(req,res){
    var person_id = req.query.id;
    var lat = req.query.lat;
    var long = req.query.long;
    var token = req.query.token;
    var gender = req.query.gender;
	var language = req.query.lang;
    console.log(gender);
    users.findOne({"userid":person_id},function(err,data){
        if(err){
          response = {"error" : true,"message" : "Error fetching data"};
          res.send(JSON.stringify(response));
        }else{
          if(data){
            data.location = lat+"-"+long;
            data.token = token;
			data.language = language;
            data.save(function(err,user){
            if(err) {
              response = {"error" : true,"message" : "Error adding data"};
              } else {
              response = {"error" : false,"message" : "Location updated: " +user.location};
              }
              res.send(JSON.stringify(response));
              });
          }else{
           var db = new users();
           db.userid = person_id;
           db.location = lat+"-"+long;
           db.likes = "[]";
           db.dislikes = "[]";
           db.matches = "[]";
           db.gender = gender;
           db.token = token;
		   db.language =language;
           db.save(function(err,user){
              if(err) {
                  response = {"error" : true,"message" : "Error adding data"};
                } else {
                 response = {"error" : false,"message" : "New user added location : "+user.location};
              }
              res.send(JSON.stringify(response));
           });
          }
        }
    });
});
app.get("/deleteprofile",function(req,res){
    var id = req.query.id;
    var response = {};
    users.findOne({"userid":id},function(e,d){
        if(e){
        response = {"error" : true,"message" : "Error while fetching data"};
        res.send(JSON.stringify(response));
        }else{
            if(d){
            d.remove(function(err){
            if(err){
                console.log("not deleted");
            }else{
                gifsaving.remove({"userid":id},function(er){
                    if(e){}else{}
                });
                reveals.remove({"userid":id},function(er){
                    if(e){}else{}
                });
                messages.find({"sender_id":id},function(e,d){
                    if(e){}else{
                    if(d){
                    messages.remove({"chat_id":d.chat_id},function(r){
                    if(r){}else{}
                    });
                }}});
                users.find({},function(error,user){
                if(error){}
                else{
                if(user){
                    for(i=0;i<user.length;i++){
                    var temp =user[i].matches;
                    var temp2 = user[i].likes;
                    var temp3 = user[i].dislikes;
                        if(temp.indexOf(id)>-1){
                            var tempMatches = JSON.parse(temp);
                            var index = tempMatches.indexOf(id);
                            tempMatches.splice(index,1);
                            user[i].matches = JSON.stringify(tempMatches);
                        }
                        if(temp2.indexOf(id)>-1){
                            var tempMatches = JSON.parse(temp2);
                            var index = tempMatches.indexOf(id);
                            tempMatches.splice(index,1);
                            user[i].likes = JSON.stringify(tempMatches);
                        }
                        if(temp3.indexOf(id)>-1){
                            var tempMatches = JSON.parse(temp3);
                            var index = tempMatches.indexOf(id);
                            tempMatches.splice(index,1);
                            user[i].dislikes = JSON.stringify(tempMatches);
                        }
                        user[i].save(function(l,m){
                            if(l){}
                            else{}
                        });
                    }
                }
                }
                });
            }

            });
            }
        }
    });
});

app.get("/getpeople",function(req,res){
    var person_id = req.query.id;
    users.findOne({"userid":person_id},function(err,data){
        if(err){
        response = {"error" : true,"message" : "Error adding data"};
        res.send(JSON.stringify(response));
        }else{
        if(data){
                var templikes = JSON.parse(data.likes);
                var tempdislikes = JSON.parse(data.dislikes);
                var finalArray = templikes.concat(tempdislikes);
                finalArray.push(person_id);
                users.find({"userid":{"$nin":finalArray}},function(e,d){
                    if(err){
                        response = {"error" : true,"message" : "Error adding data"};
                        res.send(JSON.stringify(response));
                    }else{
                      if(d){
                        response = {"error" : false,"message" : JSON.stringify(d)};
                        res.send(JSON.stringify(response));
                        }
                    }

               });
            }else{
               var finalArray = [];
               finalArray.push(person_id);
               users.find({"userid":{"$nin":finalArray}},function(e,d){
                   if(err){
                       response = {"error" : true,"message" : "Error adding data"};
                       res.send(JSON.stringify(response));
                   }else{
                     if(d){
                       response = {"error" : false,"message" : JSON.stringify(d)};
                       res.send(JSON.stringify(response));
                       }
                   }

              });
            }
        }
    });
});
app.get("/getmatches",function(req,res){
    var userid = req.query.id;
    users.findOne({"userid":userid},function(err,data){
            if(err){
            response = {"error" : true,"message" : "Error adding data"};
            res.send(JSON.stringify(response));
            }else{
            if(data){
                response = {"error" : false,"matches" : data.matches};
                res.send(JSON.stringify(response));
            }
            }
    });
});
app.get("/getmessage",function(req,res){
    var response = {};
    var m_id = req.query.m_id;
    var o_id = req.query.o_id;
    var merged1 = m_id+"-"+o_id;
    var merged2 = o_id+"-"+m_id;
    messages.find({"chat_id":{"$in":[merged1,merged2]}},function(e,d){
       if(e){
           response = {"error" : true,"message" : "Error adding data"};
           res.send(JSON.stringify(response));
       }else{
         if(d.length>-1){
           res.send(JSON.stringify(d));
         }
       }
      });
});
app.get("/sendmessage",function(req,res){
    var response = {};
    var s_id = req.query.m_id;
    var r_id = req.query.o_id;
    var c_id1 =s_id+"-"+r_id;
    var c_id2 =r_id+"-"+s_id;
    var message = req.query.message;
    var db = new messages();
    messages.find({"chat_id":{"$in":[c_id1,c_id2]}}).limit(1).exec(function(e,d){
       if(e){
         response = {"error" : true,"message" : "Error adding data"};
         res.send(JSON.stringify(response));
       }else{
       if(d.length>0){
         db.chat_id=d[0].chat_id;
       }else{
         db.chat_id = c_id1;
       }
       db.sender_id = s_id;
       db.message = message;
       db.save(function(err,data){
           if(err){
           }else{
              users.findOne({"userid":r_id},function(err,dat){
              console.log(data);
			  var lang = dat.language;
				 var msg = "";
				 if(lang=="tr"){
					 msg="Bir mesajınız var!";
				 }else if(lang=="es"){
					 msg="Tienes un mensaje!";
				 }else{
					 msg="You have a message!";
				 }
              request({
                 url: "https://fcm.googleapis.com/fcm/send",
                 method: "POST",
                 headers: {
                     "Content-Type": "application/json",
                      'Authorization': "key=AIzaSyAuAr4BrpBVlpQYZMgoUfI-nmF8FIfi5MU"
                 },
				 body: "{\"to\" : \""+dat.token+"\",\"notification\" : {\"body\" : \""+msg+"\",\"title\" : \"GIFster\"}}"
                 }, function (error, response, body){
                     console.log(body);
                 });
              });
                res.send(JSON.stringify(data));

           }
       });
       }
    });
});
app.get("/sendlikestatus",function(req,res){
    var my_id = req.query.m_id;
    var o_id = req.query.o_id;
    var type = req.query.type;
    var match = false;
    if(type=="like"){
        users.findOne({"userid":o_id},function(err,data){
               if(err){
                 response = {"error" : true,"message" : "Error fetching data"};
                 res.send(JSON.stringify(response));
               }else{
                var tempArray = JSON.parse(data.likes);
                  users.findOne({"userid":my_id},function(error,d){
                   if(error){
                      response = {"error" : true,"message" : "Error fetching data"};
                       res.send(JSON.stringify(response));
                      }else{
                       if(tempArray.indexOf(my_id)>-1){
                         match = true;
                         var matchArray = JSON.parse(data.matches);
                         matchArray.push(my_id);
                         data.matches = JSON.stringify(matchArray);
                         var tempMatches = JSON.parse(d.matches);
                         tempMatches.push(o_id);
                         d.matches = JSON.stringify(tempMatches);
                         data.save(function(e,c){
                           if(err) {}
                           else {
                           if(c){
							var lang = d.language;
								 var msg = "";
								 if(lang=="tr"){
									 msg="Bir eşleşmemiz var!";
								 }else if(lang=="es"){
									 msg="Tienes un partido!";
								 }else{
									 msg="You have a match!";
								 }
                            request({
                            url: "https://fcm.googleapis.com/fcm/send",
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                 'Authorization': "key=AIzaSyAuAr4BrpBVlpQYZMgoUfI-nmF8FIfi5MU"
                            },
                            body: "{\"to\" : \""+d.token+"\",\"notification\" : {\"body\" : \""+msg+"\",\"title\" : \"GIFster\"}}"

                            }, function (error, response, body){
                                console.log(body);
                            });
                            }
                           }
                           });
                         }
                      }
                      var templikes = JSON.parse(d.likes);
                      templikes.push(o_id);
                      d.likes = JSON.stringify(templikes);
                      d.save(function(err,user){
                      if(err) {
                         response = {"match" : false,"message" : "Error adding data"};
                      } else {
                        if(match==true){
							var lang = data.language;
								 var msg = "";
								 if(lang=="tr"){
									 msg="Bir eşleşmemiz var!";
								 }else if(lang=="es"){
									 msg="Tienes un partido!";
								 }else{
									 msg="You have a match!";
								 }
                                request({
                                url: "https://fcm.googleapis.com/fcm/send",
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    'Authorization': "key=AIzaSyAuAr4BrpBVlpQYZMgoUfI-nmF8FIfi5MU"
                                },
                                body: "{\"to\" : \""+data.token+"\",\"notification\" : {\"body\" : \""+msg+"\",\"title\" : \"GIFster\"}}"

                                }, function (error, response, body){
                                    console.log(body);
                                });

                        }
                         response = {"match" : match,"message" : "likes updated: " +user.likes};
                      }
                         res.send(JSON.stringify(response));
                      });


                });
              }

    });
    }else if(type=="dislike"){
         users.findOne({"userid":my_id},function(error,d){
                if(error){
                 response = {"error" : true,"message" : "Error fetching data"};
                 res.send(JSON.stringify(response));
                }else{
                    var templikes = JSON.parse(d.dislikes);
                    templikes.push(o_id);
                    d.dislikes = JSON.stringify(templikes);
                    d.save(function(err,user){
                    if(err) {
                       response = {"error" : true,"message" : "Error adding data"};
                       } else {
                       response = {"error" : false,"message" : "DisLikes updated: " +user.dislikes};
                       }
                       res.send(JSON.stringify(response));
                    });
                }

    });
    }
});
app.get("/sendmyprofile",function(req,res){
    var name = req.query.name;
    var id = req.query.id;
    var link = "https://www.facebook.com/app_scoped_user_id/" + id;
    var pic_link ="https://graph.facebook.com/"+id+"/picture?type=large";
    var r_id = req.query.o_id;
    console.log("başta");
    var response = {};
    reveals.findOne({"userid":r_id},function(error,data){
           if(error){
            response = {"error" : true,"message" : "Error fetching data"};
            res.send(JSON.stringify(response));
           }else{
             console.log("elsete");

                if(data){
                  console.log("datada");
                    var profile_array = JSON.parse(data.revealed_profiles);
                    var single_array = {"name":name,"link":link,"pic_link":pic_link};
                    if(!(data.revealed_profiles.indexOf(single_array)>-1)){
                    profile_array.push(JSON.stringify(single_array));
                    data.save(function(e,d){
                    if(e){
                      response = {"error" : true,"message" : "Error while saving data"};
                      res.send(JSON.stringify(response));
                    }else{
                        if(d){
							var lang = data.language;
								 var msg = "";
								 if(lang=="tr"){
									 msg="Birisi sizinle profilini paylaştı!";
								 }else if(lang=="es"){
									 msg="Alguien reveló un perfil!";
								 }else{
									 msg="Someone revealed a profile to you!";
								 }
                          request({
                             url: "https://fcm.googleapis.com/fcm/send",
                             method: "POST",
                             headers: {
                                 "Content-Type": "application/json",
                                 'Authorization': "key=AIzaSyAuAr4BrpBVlpQYZMgoUfI-nmF8FIfi5MU"
                             },
                             body: "{\"to\" : \""+data.token+"\",\"notification\" : {\"body\" : \""+msg+"\",\"title\" : \"GIFster\"}}"

                             }, function (error, response, body){
                                 console.log(body);
                             });

                        response = {"error" : false,"message" : "success"};
                        res.send(JSON.stringify(response));
                        }
                    }
                    });
                    }
                }else{
                  console.log("yeni nesne");
                    var db = new reveals();
                    db.userid = r_id;
                    var profile_array = [];
                    var single_array = {"name":name,"link":link,"pic_link":pic_link};
                    profile_array.push(JSON.stringify(single_array));
                    db.revealed_profiles=JSON.stringify(profile_array);
                       db.save(function(e,d){
                        if(e){
                          response = {"error" : true,"message" : "Error while saving data"};
                          res.send(JSON.stringify(response));
                        }else{
                            if(d){
                             users.findOne({"userid":r_id},function(err,dat){
								 var lang = dat.language;
								 var msg = "";
								 if(lang=="tr"){
									 msg="Birisi sizinle profilini paylaştı!";
								 }else if(lang=="es"){
									 msg="Alguien reveló un perfil!";
								 }else{
									 msg="Someone revealed a profile to you!";
								 }
                              request({
                                 url: "https://fcm.googleapis.com/fcm/send",
                                 method: "POST",
                                 headers: {
                                     "Content-Type": "application/json",
                                      'Authorization': "key=AIzaSyAuAr4BrpBVlpQYZMgoUfI-nmF8FIfi5MU"
                                 },
                                 body: "{\"to\" : \""+dat.token+"\",\"notification\" : {\"body\" : \""+msg+"\",\"title\" : \"GIFster\"}}"

                                 }, function (error, response, body){
                                     console.log(body);
                                 });
                              });
                                response = {"error" : false,"message" : "success"};
                                res.send(JSON.stringify(response));
                            }
                        }
                        });
                }
           }
    });
});
app.get("/getreveals",function(req,res){
    var id = req.query.id;
    var response = {};
    reveals.findOne({"userid":id},function(e,d){
        if(e){
        response = {"error" : true,"message" : "Error while fetching data"};
        res.send(JSON.stringify(response));
        }else{
            if(d){
            response = {"error" : false,"message" : d.revealed_profiles};
            res.send(JSON.stringify(response));
            }else{
            response = {"error" : true,"message" : "no reveals yet"};
            res.send(JSON.stringify(response));
            }
        }
    });
});
app.get("/deletetoken",function(req,res){
    var id = req.query.id;
    var response = {};
    users.findOne({"userid":id},function(e,d){
        if(e){
        response = {"error" : true,"message" : "Error while fetching data"};
        res.send(JSON.stringify(response));
        }else{
           if(d){
            d.token = "";
            d.save(function(err,user){
            if(err) {
              response = {"error" : true,"message" : "Error adding data"};
              } else {
				console.log("token silindi");
              response = {"error" : false,"message" : "Location updated: "};
              }
              res.send(JSON.stringify(response));
              });
          }
        }
    });
});
http.listen(process.env.PORT || 5000, function(){
  console.log('listening on *:5000');
});
