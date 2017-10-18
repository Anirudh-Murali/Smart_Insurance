library(twitteR)
library(stringr)

consumer_key <- 'isHZiS0HdJQZlDv5RBbKanZhd'
consumer_secret <- 'PrhymxQhMTZeXNrjY1JisqBrz4y7NJqSbv1DVzWoNbiMC35Hf1'
access_token <- '1492826593-V1aXd53eZY3MWMhmfE9bIZjbf2Vkk6eDPxKzWXn'
access_secret <- 'tumGfeIgBienl0hMH4xa4THYHHFuqlZKod72qqI7wG6HF'
twitteR::setup_twitter_oauth(consumer_key,consumer_secret,access_token,access_secret)

abc <- TRUE

  

while (abc){ 
screenName <- "@Swastik_cse"

taggedTweets <- twitteR::searchTwitter(screenName, lang = "en", n = 100 , resultType ="recent" )
tweets <- twitteR::userTimeline(screenName, n = 100)


taggedTweets<- sapply(taggedTweets, function(x) x$getText())
taggedTweets <- str_replace_all(taggedTweets, "[\r\n]" , "")

tweets <- sapply(tweets, function(x) x$getText())
tweets <- str_replace_all(tweets, "[\r\n]" , "")

write(tweets,file = "tweets.txt")
write(taggedTweets, file = "taggedTweets.txt")
Sys.sleep(60)
}
print("OK")