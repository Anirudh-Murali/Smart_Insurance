#setwd("/home/HDFC")
ldf <- read.csv("insurance.csv")

#creating the regrestion model
life <- lm(charges ~ age + sex + bmi + children + smoker , data = ldf )

#Importing the user data
uli <- read.csv("life_input.txt" ,header = FALSE)
lage <- uli[1,1]
lsex <- uli[1,2]
lbmi <- uli[1,3]
lchild <- uli[1,4]
lsmoke <- uli[1,5]
lpin   <- uli[1,6]
lcover <- uli[1,7]


longTerm <- FALSE


#prediction
out <- predict(life, data.frame(age = lage , sex = lsex , bmi = lbmi , children = lchild , smoker = lsmoke ),
               interval = 'prediction')
out <- out/10 
riskfactor <- out[1,1]/100 + 10
out <- out + 3000
new <- ((out[1,3]-out[1,2])*lcover)+out[1,2]



####Calculating Other Factors####

pinData <- read.csv("pinCode.csv")
#input <- read.csv("life_input.txt",header = FALSE)
crimeSet <- read.csv("crime.csv",stringsAsFactors = FALSE)
pollution <- read.csv("pollution.csv",header = FALSE,stringsAsFactors = FALSE)
pincode <- lpin
i <- 1

while(pinData[i,1]!=pincode)
  i <- i + 1  

city <- pinData[i,2]
taluk <- pinData[i,3]
district <- pinData[i,4]
state <- pinData[i,5]


#####Calculating Disaster Factor ####

statecode <- function(){
  if(state == "JAMMU & KASHMIR")
    code <- 1
  else if(state == "ODISHA")
    code <- 2
  
  else if(state == "ANDHRA PRADESH")
    code <- 3
  else if(state == "TELANGANA")
    code <- 3
  else if(state == "HIMACHAL PRADESH")
    code <- 4
  else if(state == "TAMIL NADU")
    code <- 5
  else if(state == "PONDICHERRY")
    code <- 5
  else if(state == "UTTARAKHAND")
    code <- 6
  else if(state == "SIKKIM")
    code <- 8
  else if(state == "WEST BENGAL")
    code <- 7
  else if(state == "KARNATAKA")
    code <- 9
  else if(state == "BIHAR")
    code <- 10
  else if(state == "MAHARASHTRA")
    code <- 11
  else if(state == "GUJRAT")
    code <- 12
  else if(state == "KERALA")
    code <- 13
  else if(state == "ANDAMAN & NICOBAR ISLANDS")
    code <- 14
  else
    code <- 17
  return(code)
  
}
code <- as.integer(statecode())

if(code<16){
  disaterFactor <- switch(
    code,
    188.96,
    611.85,
    683.486,
    204.7,
    232.586,
    209.9,
    2,
    9.5,
    12,
    44.16,
    483.92,
    966.35,
    200.486,
    50.486,
    50.486
  )
}
disaterFactor <- disaterFactor/10

####Calculating Crime Factor####

crimeRate <- crimeSet[,c(1,2,91)]
i <- 1
j <- 1
while(crimeRate[i,2] !=  district && !is.na(crimeRate[i,2]== district))
  i<- i+1
if(is.na(crimeRate[i,2]== district))
{
  majorCities <- read.csv("majorCitiesCrimes.csv",stringsAsFactors = FALSE)
  j <- 1
  while(majorCities[j,1]!=city)
    j <- j+1
  
  crimeFactor <- majorCities[j,2]/10
}else
  crimeFactor <- crimeRate[i,3]/100
print("fd")


####Calculating Pollution Factor####


i <- 1
while(pollution[i,2]!= city)
  i <- i + 1
So2 <- pollution[i,4]
No2 <- pollution[i,5]
PM <- pollution[i,6]

calcWeight <- function(x){
  if(x == "Null")
    return(0)
  else if(x == "Low")
    return(0.25)
  else if(x == "Moderate")
    return(0.5)
  else if(x == "High")
    return(0.75)
  else if(x == "Critical")
    return(1)
  else return(0.25)
}
So2weight <- calcWeight(So2)
No2weight <- calcWeight(No2)
PMweight <- calcWeight(PM)

pollutionFactor <- 3.3*So2weight + 3.3*No2weight + 3.3*PMweight

####Calculating Facilities Factor#####


####Final Changes####
if(lsmoke == "yes")
{
  new <- new - 1200
  riskfactor <- riskfactor - 12
  
}
new <- new + disaterFactor + pollutionFactor + crimeFactor

riskfactor <- riskfactor + disaterFactor/10 + pollutionFactor/10 + crimeFactor/10

if(riskfactor[1] < 25)
  longTerm <- TRUE



####Create Linear Model for risk#####
risk_input <- read.csv("2_input.txt", header = FALSE)
e <- risk_input[1,1]
b <- risk_input[1,2]
r<- risk_input[1,3]
w<- risk_input[1,4]
g<- risk_input[1,5]
t<- risk_input[1,6]
d<- risk_input[1,7]
ex<- risk_input[1,8]
j<- risk_input[1,9]

exercise <- -0.5
bike <- -0.5
run <- -0.5
walk <- -0.1
golf <- -0.1
travel <- 0.5
drunk <- 0.7
extreme <- 0.6
junkfood <- 0.5


exercise <- as.numeric(exercise*e)
walk <- as.numeric(walk*w)
golf <- as.numeric(golf*g)
travel <- as.numeric(travel*t)
drunk<- as.numeric(drunk*d)
extreme <- as.numeric(extreme*ex)
junkfood <- as.numeric(junkfood*j )
bike <- as.numeric(bike*b)
run <- as.numeric(run*r)

newRisk <- riskfactor + exercise + walk + golf + travel + drunk + extreme + junkfood +bike + run

####FINAL OUTPUT####




flag <- c(d,ex,j,t)
flag <- sort(flag)
find_element <- function(x){
  
  if(x == d ){
    return ("alcohol")}
  else if(x == ex ){
    return ("extreme sports") }
  else if(x == j){
    return ("junk food")}
  else if(x == t){
    return ("travel")}else
      return("travel")
  
}  
m1 <- find_element(flag[4])
m2 <- find_element(flag[3])
if(longTerm == TRUE)
{   
  newLong <- new*1.5
  newLong
}else
{
  newLong <- FALSE
}
arr<-c(new,riskfactor,newRisk,longTerm,newLong,m1,m2)
print(arr)