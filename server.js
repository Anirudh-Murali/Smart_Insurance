var express = require('express')
var cors = require('cors')
var MongoClient = require('mongodb').MongoClient
var R = require('r-script')
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
var fs = require('fs')
var fs2 = require('fs')
var natural = require('natural')
var classifier = new natural.LogisticRegressionClassifier();
var total_tweets = 0;
var total_tweets_tagged = 0;
var natural = require('natural')
var classifier = new natural.LogisticRegressionClassifier();
var credit_classifier = new natural.LogisticRegressionClassifier();

var lineReader = require('readline').createInterface({
							  input: require('fs').createReadStream('tweets.txt')
							});

var app = express()
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(cors())

var threshold = 0.8

var life_out;
var car_out;
var url = "mongodb://localhost:27017/HDFC";


var screen_names = ["Swastik_cse"];

app.post('/',function(req,res){


	MongoClient.connect(url,function(err,db){

		if(!err)
		{
			console.log("connected")
		}

		var collection = db.collection('profile');
		var BMI = (req.body.weight)/((req.body.height*req.body.height)/10000)
		var age_arr = (req.body.dob).split('/')
		var age = 2017 - parseInt(age_arr[2])
		var cover = (parseInt(req.body.cover) - 25000)/475000;
		
		var promise_1 = new Promise(function(resolve,reject){
			collection.find({name:req.body.name,DOB:req.body.DOB}).toArray(function(err,result){
				if(result.length == 0)
				{
					screen_names.push(req.body.twitter)
					console.log(req.data)
					collection.insert({"name":req.body.name,"email":req.body.email,"gender":req.body.gender,"age":age,"BMI":BMI,"dob":req.body.dob,"height":req.body.height,"weight":req.body.weight,"mastatus":req.body.mastatus,"child":req.body.child,"pincode":req.body.pincode,"smoke":req.body.smoke,"twitter":req.body.twitter,"cover":cover,"tweets":total_tweets,"tagged_tweets":total_tweets_tagged,"risky_tweets":0,sleep:0,exercise:0,run:0,bike:0,walk:0,workout:0,golf:0,shopping:0,recharge:0,junkFood:0,bills:0,movie:0,extreme:0,travel:0,drink:0,n1:0,n2:0,n3:0});
												
				}
				else
				{
					collection.update({name:req.body.name,DOB:req.body.DOB},{$set:{"age":age,"BMI":BMI,"height":req.body.height,"weight":req.body.weight,"mastatus":req.body.mastatus,"child":req.body.child,"pincode":req.body.pincode,"cover":cover,n1:0,n2:0,n3:0}});
					
				}
			
				setTimeout(function(){
					resolve(req.body);
				},2000)
										
			})

		})

		promise_1.then((fulfilled)=>{
			/*var args = age + ',' + req.body.gender + ',' + BMI + ',' + req.body.child + ',' + req.body.smoke + ',' + req.body.pincode + ',' + cover

			fs.writeFile('life_input.txt', args, function (err) {
		  		if (err) return console.log(err);
			  	console.log(args);

			  	life_out = R("1st.R")
		  			.callSync();
	  	
  			});*/

  			res.send("added to db");
			db.close();

		})

	})
})



setInterval(function(){
	MongoClient.connect(url,function(err,db){

		console.log("inside mongoclient")
		natural.LogisticRegressionClassifier.load('final.json', null, function(err, classifier) {
		
		
			console.log("inside setinterval")
			var collection = db.collection('profile');
			var characters = {  congratulations:0,
									travelling:0,
									wishes:0,
									drunk:0,
									extreme:0

					}

			screen_names.forEach((i)=>{
				var out;
				var tweets_count = 0;
				var tweets_tagged_count = 0;
				var tweet = []
				var tagged_tweet = []
				

				console.log(i)
				collection.find({twitter:i}).toArray(function(err,result){
					console.log("inside screen name find")
					console.log(result)
					if(result.length!=0)
					{
						console.log("inside screen name find result")
						var p1 = new Promise(function(resolve,reject){
							
							require('fs').readFileSync('tweets.txt').toString().split('\n').forEach(function (line) { 
								tweet.push(line);
								tweets_count+=1;
								console.log("tweets read")

							})

							require('fs').readFileSync('taggedTweets.txt').toString().split('\n').forEach(function (line) { 
								tagged_tweet.push(line);
								tweets_tagged_count+=1;
								console.log("tagged tweets read")
								//resolve("done")

							})

							collection.find({"twitter":i}).toArray(function(err,result){
								//console.log("classification area")
								console.log(result[0].tweets +" " + tweets_count)
								if(result[0].tweets < tweets_count)
								{
									console.log("inside first if")
									
									for(var x = 0; x < tweets_count - result[0].tweets ; x++)
									{
										console.log(tweet[x])
										if(classifier.classify(tweet[x])=="congratulations" && classifier.getClassifications(tweet[x])[0].value > threshold )
										{
											characters.congratulations+=1;
										}
										else if(classifier.classify(tweet[x]) == "extreme" && classifier.getClassifications(tweet[x])[0].value > threshold )
										{
											characters.extreme+=1;
										}
										else if(classifier.classify(tweet[x]) == "travelling" && classifier.getClassifications(tweet[x])[0].value > threshold )
										{
											characters.travelling+=1;
										}
										else if(classifier.classify(tweet[x]) == "drunk" && classifier.getClassifications(tweet[x])[0].value > threshold )
										{
											characters.drunk+=1;
										}
										else if(classifier.getClassifications(tweet[x])[0].value > threshold )
										{
											characters.wishes+=1;
										}
									}

								}

								collection.update({twitter:i},{$set:{tweets:tweets_count}});


								if(result[0].tagged_tweets < tweets_tagged_count)
								{
									//console.log("inside 2nd if")
									for(var x = 0; x < tweets_tagged_count - result[0].tagged_tweets ; x++)
									{
										//console.log(tagged_tweet[x]);
										if(classifier.classify(tagged_tweet[x])=="congratulations" && classifier.getClassifications(tagged_tweet[x])[0].value > threshold )
										{
											characters.congratulations+=1;
										}
										else if(classifier.classify(tagged_tweet[x]) == "extreme" && classifier.getClassifications(tagged_tweet[x])[0].value > threshold )
										{
											characters.extreme+=1;
										}
										else if(classifier.classify(tagged_tweet[x]) == "travelling" && classifier.getClassifications(tagged_tweet[x])[0].value > threshold )
										{
											characters.travelling+=1;
										}
										else if(classifier.classify(tagged_tweet[x]) == "drunk" && classifier.getClassifications(tagged_tweet[x])[0].value > threshold )
										{
											characters.drunk+=1;
										}
										else if(classifier.getClassifications(tagged_tweet[x])[0].value > threshold )
										{
											characters.wishes+=1;
										}
									}

									
								}

								collection.update({twitter:i},{$set:{tagged_tweets:tweets_tagged_count}});
								resolve("done")

								
							})

								  						
						})

						p1.then((fulfilled)=>{
							console.log(characters)
							var risky = characters.extreme + characters.travelling + characters.drunk;
							collection.update({twitter:i},{$inc:{risky_tweets:risky,extreme:characters.extreme,travel:characters.travelling,drink:characters.drunk}});
							console.log("finally risks updated")
							db.close();
						})
					}
				})
			})
			

		
		})

		
	
	})

},10000)

var credit_card = {
		travel:0,
		bar:0,
		shopping:0,
		recharge:0,
		junkFood:0,
		bills:0,
		movie:0
	}
	

app.post("/msgs",function(req,res){

	
	//console.log(req.body.msg1)

	var promise = new Promise(function(resolve,reject){
		natural.LogisticRegressionClassifier.load('credit.json', null, function(err, credit_classifier) {

					if(credit_classifier.classify(req.body.msg1) == "bar" && credit_classifier.getClassifications(req.body.msg1)[0].value > threshold)
					{
						credit_card.bar+=1;
					}
					else if(credit_classifier.classify(req.body.msg1) == "travel" && credit_classifier.getClassifications(req.body.msg1)[0].value > threshold)
					{
						credit_card.travel+=1;
					}
					else if(credit_classifier.classify(req.body.msg1) == "shopping" && credit_classifier.getClassifications(req.body.msg1)[0].value > threshold)
					{
						credit_card.shopping+=1;
					}
					else if(credit_classifier.classify(req.body.msg1) == "recharge" && credit_classifier.getClassifications(req.body.msg1)[0].value > threshold)
					{
						credit_card.recharge+=1;
					}
					else if(credit_classifier.classify(req.body.msg1) == "junkFood" && credit_classifier.getClassifications(req.body.msg1)[0].value > threshold)
					{
						credit_card.junkFood+=1;
					}
					else if(credit_classifier.classify(req.body.msg1) == "bills" && credit_classifier.getClassifications(req.body.msg1)[0].value > threshold)
					{
						credit_card.bills+=1;
					}
					else if(credit_classifier.classify(req.body.msg1) == "movie" && credit_classifier.getClassifications(req.body.msg1)[0].value > threshold)
					{
						credit_card.movie+=1;
					}

					if(credit_classifier.classify(req.body.msg2) == "bar" && credit_classifier.getClassifications(req.body.msg2)[0].value > threshold)
					{
						credit_card.bar+=1;
					}
					else if(credit_classifier.classify(req.body.msg2) == "travel" && credit_classifier.getClassifications(req.body.msg2)[0].value > threshold)
					{
						credit_card.travel+=1;
					}
					else if(credit_classifier.classify(req.body.msg2) == "shopping" && credit_classifier.getClassifications(req.body.msg2)[0].value > threshold)
					{
						credit_card.shopping+=1;
					}
					else if(credit_classifier.classify(req.body.msg2) == "recharge" && credit_classifier.getClassifications(req.body.msg2)[0].value > threshold)
					{
						credit_card.recharge+=1;
					}
					else if(credit_classifier.classify(req.body.msg2) == "junkFood" && credit_classifier.getClassifications(req.body.msg2)[0].value > threshold)
					{
						credit_card.junkFood+=1;
					}
					else if(credit_classifier.classify(req.body.msg2) == "bills" && credit_classifier.getClassifications(req.body.msg2)[0].value > threshold)
					{
						credit_card.bills+=1;
					}
					else if(credit_classifier.classify(req.body.msg2) == "movie" && credit_classifier.getClassifications(req.body.msg2)[0].value > threshold)
					{
						credit_card.movie+=1;
					}

					if(credit_classifier.classify(req.body.msg3) == "bar" && credit_classifier.getClassifications(req.body.msg3)[0].value > threshold)
					{
						credit_card.bar+=1;
					}
					else if(credit_classifier.classify(req.body.msg3) == "travel" && credit_classifier.getClassifications(req.body.msg3)[0].value > threshold)
					{
						credit_card.travel+=1;
					}
					else if(credit_classifier.classify(req.body.msg3) == "shopping" && credit_classifier.getClassifications(req.body.msg3)[0].value > threshold)
					{
						credit_card.shopping+=1;
					}
					else if(credit_classifier.classify(req.body.msg3) == "recharge" && credit_classifier.getClassifications(req.body.msg3)[0].value > threshold)
					{
						credit_card.recharge+=1;
					}
					else if(credit_classifier.classify(req.body.msg3) == "junkFood" && credit_classifier.getClassifications(req.body.msg3)[0].value > threshold)
					{
						credit_card.junkFood+=1;
					}
					else if(credit_classifier.classify(req.body.msg3) == "bills" && credit_classifier.getClassifications(req.body.msg3)[0].value > threshold)
					{
						credit_card.bills+=1;
					}
					else if(credit_classifier.classify(req.body.msg3) == "movie" && credit_classifier.getClassifications(req.body.msg1)[0].value > threshold)
					{
						credit_card.movie+=1;
					}

					if(credit_classifier.classify(req.body.msg4) == "bar" && credit_classifier.getClassifications(req.body.msg4)[0].value > threshold)
					{
						credit_card.bar+=1;
					}
					else if(credit_classifier.classify(req.body.msg4) == "travel" && credit_classifier.getClassifications(req.body.msg4)[0].value > threshold)
					{
						credit_card.travel+=1;
					}
					else if(credit_classifier.classify(req.body.msg4) == "shopping" && credit_classifier.getClassifications(req.body.msg4)[0].value > threshold)
					{
						credit_card.shopping+=1;
					}
					else if(credit_classifier.classify(req.body.msg4) == "recharge" && credit_classifier.getClassifications(req.body.msg4)[0].value > threshold)
					{
						credit_card.recharge+=1;
					}
					else if(credit_classifier.classify(req.body.msg4) == "junkFood" && credit_classifier.getClassifications(req.body.msg4)[0].value > threshold)
					{
						credit_card.junkFood+=1;
					}
					else if(credit_classifier.classify(req.body.msg4) == "bills" && credit_classifier.getClassifications(req.body.msg4)[0].value > threshold)
					{
						credit_card.bills+=1;
					}
					else if(credit_classifier.classify(req.body.msg4) == "movie" && credit_classifier.getClassifications(req.body.msg4)[0].value > threshold)
					{
						credit_card.movie+=1;
					}

					if(credit_classifier.classify(req.body.msg5) == "bar" && credit_classifier.getClassifications(req.body.msg5)[0].value > threshold)
					{
						credit_card.bar+=1;
					}
					else if(credit_classifier.classify(req.body.msg5) == "travel" && credit_classifier.getClassifications(req.body.msg5)[0].value > threshold)
					{
						credit_card.travel+=1;
					}
					else if(credit_classifier.classify(req.body.msg5) == "shopping" && credit_classifier.getClassifications(req.body.msg5)[0].value > threshold)
					{
						credit_card.shopping+=1;
					}
					else if(credit_classifier.classify(req.body.msg5) == "recharge" && credit_classifier.getClassifications(req.body.msg5)[0].value > threshold)
					{
						credit_card.recharge+=1;
					}
					else if(credit_classifier.classify(req.body.msg5) == "junkFood" && credit_classifier.getClassifications(req.body.msg5)[0].value > threshold)
					{
						credit_card.junkFood+=1;
					}
					else if(credit_classifier.classify(req.body.msg5) == "bills" && credit_classifier.getClassifications(req.body.msg5)[0].value > threshold)
					{
						credit_card.bills+=1;
					}
					else if(credit_classifier.classify(req.body.msg5) == "movie" && credit_classifier.getClassifications(req.body.msg5)[0].value > threshold)
					{
						credit_card.movie+=1;
					}

					if(credit_classifier.classify(req.body.msg6) == "bar" && credit_classifier.getClassifications(req.body.msg6)[0].value > threshold)
					{
						credit_card.bar+=1;
					}
					else if(credit_classifier.classify(req.body.msg6) == "travel" && credit_classifier.getClassifications(req.body.msg6)[0].value > threshold)
					{
						credit_card.travel+=1;
					}
					else if(credit_classifier.classify(req.body.msg6) == "shopping" && credit_classifier.getClassifications(req.body.msg6)[0].value > threshold)
					{
						credit_card.shopping+=1;
					}
					else if(credit_classifier.classify(req.body.msg6) == "recharge" && credit_classifier.getClassifications(req.body.msg6)[0].value > threshold)
					{
						credit_card.recharge+=1;
					}
					else if(credit_classifier.classify(req.body.msg6) == "junkFood" && credit_classifier.getClassifications(req.body.msg6)[0].value > threshold)
					{
						credit_card.junkFood+=1;
					}
					else if(credit_classifier.classify(req.body.msg6) == "bills" && credit_classifier.getClassifications(req.body.msg6)[0].value > threshold)
					{
						credit_card.bills+=1;
					}
					else if(credit_classifier.classify(req.body.msg6) == "movie" && credit_classifier.getClassifications(req.body.msg6)[0].value > threshold)
					{
						credit_card.movie+=1;
					}

					if(credit_classifier.classify(req.body.msg7) == "bar" && credit_classifier.getClassifications(req.body.msg7)[0].value > threshold)
					{
						credit_card.bar+=1;
					}
					else if(credit_classifier.classify(req.body.msg7) == "travel" && credit_classifier.getClassifications(req.body.msg7)[0].value > threshold)
					{
						credit_card.travel+=1;
					}
					else if(credit_classifier.classify(req.body.msg7) == "shopping" && credit_classifier.getClassifications(req.body.msg7)[0].value > threshold)
					{
						credit_card.shopping+=1;
					}
					else if(credit_classifier.classify(req.body.msg7) == "recharge" && credit_classifier.getClassifications(req.body.msg7)[0].value > threshold)
					{
						credit_card.recharge+=1;
					}
					else if(credit_classifier.classify(req.body.msg7) == "junkFood" && credit_classifier.getClassifications(req.body.msg7)[0].value > threshold)
					{
						credit_card.junkFood+=1;
					}
					else if(credit_classifier.classify(req.body.msg7) == "bills" && credit_classifier.getClassifications(req.body.msg7)[0].value > threshold)
					{
						credit_card.bills+=1;
					}
					else if(credit_classifier.classify(req.body.msg7) == "movie" && credit_classifier.getClassifications(req.body.msg7)[0].value > threshold)
					{
						credit_card.movie+=1;
					}

					if(credit_classifier.classify(req.body.msg8) == "bar" && credit_classifier.getClassifications(req.body.msg8)[0].value > threshold)
					{
						credit_card.bar+=1;
					}
					else if(credit_classifier.classify(req.body.msg8) == "travel" && credit_classifier.getClassifications(req.body.msg8)[0].value > threshold)
					{
						credit_card.travel+=1;
					}
					else if(credit_classifier.classify(req.body.msg8) == "shopping" && credit_classifier.getClassifications(req.body.msg8)[0].value > threshold)
					{
						credit_card.shopping+=1;
					}
					else if(credit_classifier.classify(req.body.msg8) == "recharge" && credit_classifier.getClassifications(req.body.msg8)[0].value > threshold)
					{
						credit_card.recharge+=1;
					}
					else if(credit_classifier.classify(req.body.msg8) == "junkFood" && credit_classifier.getClassifications(req.body.msg8)[0].value > threshold)
					{
						credit_card.junkFood+=1;
					}
					else if(credit_classifier.classify(req.body.msg8) == "bills" && credit_classifier.getClassifications(req.body.msg8)[0].value > threshold)
					{
						credit_card.bills+=1;
					}
					else if(credit_classifier.classify(req.body.msg8) == "movie" && credit_classifier.getClassifications(req.body.msg8)[0].value > threshold)
					{
						credit_card.movie+=1;
					}

					if(credit_classifier.classify(req.body.msg9) == "bar" && credit_classifier.getClassifications(req.body.msg9)[0].value > threshold)
					{
						credit_card.bar+=1;
					}
					else if(credit_classifier.classify(req.body.msg9) == "travel" && credit_classifier.getClassifications(req.body.msg9)[0].value > threshold)
					{
						credit_card.travel+=1;
					}
					else if(credit_classifier.classify(req.body.msg9) == "shopping" && credit_classifier.getClassifications(req.body.msg9)[0].value > threshold)
					{
						credit_card.shopping+=1;
					}
					else if(credit_classifier.classify(req.body.msg9) == "recharge" && credit_classifier.getClassifications(req.body.msg9)[0].value > threshold)
					{
						credit_card.recharge+=1;
					}
					else if(credit_classifier.classify(req.body.msg9) == "junkFood" && credit_classifier.getClassifications(req.body.msg9)[0].value > threshold)
					{
						credit_card.junkFood+=1;
					}
					else if(credit_classifier.classify(req.body.msg9) == "bills" && credit_classifier.getClassifications(req.body.msg9)[0].value > threshold)
					{
						credit_card.bills+=1;
					}
					else if(credit_classifier.classify(req.body.msg9) == "movie" && credit_classifier.getClassifications(req.body.msg9)[0].value > threshold)
					{
						credit_card.movie+=1;
					}

					if(credit_classifier.classify(req.body.msg10) == "bar" && credit_classifier.getClassifications(req.body.msg10)[0].value > threshold)
					{
						credit_card.bar+=1;
					}
					else if(credit_classifier.classify(req.body.msg10) == "travel" && credit_classifier.getClassifications(req.body.msg10)[0].value > threshold)
					{
						credit_card.travel+=1;
					}
					else if(credit_classifier.classify(req.body.msg10) == "shopping" && credit_classifier.getClassifications(req.body.msg10)[0].value > threshold)
					{
						credit_card.shopping+=1;
					}
					else if(credit_classifier.classify(req.body.msg10) == "recharge" && credit_classifier.getClassifications(req.body.msg10)[0].value > threshold)
					{
						credit_card.recharge+=1;
					}
					else if(credit_classifier.classify(req.body.msg10) == "junkFood" && credit_classifier.getClassifications(req.body.msg10)[0].value > threshold)
					{
						credit_card.junkFood+=1;
					}
					else if(credit_classifier.classify(req.body.msg10) == "bills" && credit_classifier.getClassifications(req.body.msg10)[0].value > threshold)
					{
						credit_card.bills+=1;
					}
					else if(credit_classifier.classify(req.body.msg10) == "movie" && credit_classifier.getClassifications(req.body.msg10)[0].value > threshold)
					{
						credit_card.movie+=1;
					}

				resolve("done");
		})
	})

	promise.then((fulfilled)=>{
		MongoClient.connect(url,function(err,db){
			var collection = db.collection('profile')

			console.log(req.body.email)
			collection.update({"email":req.body.email},{$inc:{travel:credit_card.travel,drink:credit_card.bar,shopping:credit_card.shopping,recharge:credit_card.recharge,junkFood:credit_card.junkFood,bills:credit_card.bills,movie:credit_card.movie}});
			collection.update({"email":req.body.email},{$set:{sleep:4,exercise:5,run:6,bike:7,walk:3,workout:3,golf:0}})
			console.log("credit card data updated");
			

			db.close();
		})
	}).then((fulfilled)=>{
		res.send("credit card data updated");
	})
	

})


app.post("/risk",function(req,res){
	MongoClient.connect(url,function(err,db){
		var collection = db.collection('profile')
		var _arr = []
		
		var prom = new Promise(function(resolve,reject){
			collection.find({"email":req.body.email}).toArray(function(err,result){
				if(result.length!=0)
				{
					var args = result[0].age + ',' + result[0].gender + ',' + result[0].BMI + ',' + result[0].child + ',' + result[0].smoke + ',' + result[0].pincode + ',' + result[0].cover;
					var args2 = result[0].exercise + ',' + result[0].bike + ',' + result[0].run + ',' + result[0].walk + ',' + result[0].golf + ',' + result[0].travel + ',' + result[0].drink + ',' + result[0].extreme + ',' + result[0].junkFood;
					
					_arr = [result[0].drink,result[0].travel,result[0].shopping,result[0].recharge,result[0].junkFood,result[0].bills,result[0].movie];
					

					fs.writeFile('life_input.txt', args, function (err) {
				  		if (err) return console.log(err);
					  	console.log(args);

					  	fs2.writeFile('2_input.txt', args2, function(err) {
					  		if(err) return console.log(err + "in 2_input read");
					  		console.log(args2);

					  		life_out = R("2.R")
					  			.callSync();

					  		if(life_out)
					  		{
					  			resolve(life_out)
					  		}
					  	})

	  				});
				}
			})

		})

		prom.then((fulfilled)=>{
			console.log(life_out);

			var pr = new Promise(function(resolve,reject){
				
				collection.update({"email":req.body.email},{$push:{"risk_factor":life_out[2]}})
				collection.update({"email":req.body.email},{$set:{"premium":life_out[0],"tag_1":life_out[5],"tag_2":life_out[6]}})
					

				setTimeout(function(){
					resolve("done");

				},2000)
					
				
			}).then((fulfilled)=>{
				res.send({
					"R_arr":life_out,
					"frequency":_arr
				});
				db.close();
			})


			
		})

	})
})

app.get("/web",function(req,res){
	MongoClient.connect(url,function(err,db){
		var collection = db.collection('profile');

		collection.find().toArray(function(err,result)
		{
			res.send(result);
		})
	})
})

app.get("/notif",function(req,res){
	MongoClient.connect(url,function(err,db){
		var collection = db.collection('profile');

		collection.find().toArray(function(err,result){
			res.send({
				"first":result[0].n1,
				"second":result[0].n2,
				"third":result[0].n3
			})
		})

	})
})


app.post('/watch',function(req,res){
	console.log(req.body);
	res.send(req.body+" printed");
})

app.get("/car1",function(req,res){
	MongoClient.connect(url,function(err,db){
		var collection = db.collection('profile')

		collection.update({"email":"swastikshrivastava0@gmail.com"},{$set:{n2:1}});

		res.send("done car1");

		db.close();
	})
})

app.get("/car2",function(req,res){
	MongoClient.connect(url,function(err,db){
		var collection = db.collection('profile')

		collection.update({"email":"swastikshrivastava0@gmail.com"},{$set:{n3:1}});

		res.send("done car2")
		db.close();
	})
})



setInterval(function(){
	MongoClient.connect(url,function(err,db){
		var collection = db.collection('profile')

		collection.find().toArray(function(err,result){
			if(parseInt((result[0].risk_factor[result[0].risk_factor.length - 1]-parseInt(result[0].risk_factor[0])) > 3))
			{
				collection.update({"email":"swastikshrivastava0@gmail.com"},{$set:{n1:1}});
			}
		})

		db.close();
	})
},10000)

app.listen(8082);
