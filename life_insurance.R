
#Importing the data
setwd("/media/alfread/Stuff/Projects/Insuarnce/DataRefined/useable data/Life Insuarance")
ldf <- read.csv("insurance.csv")




#Creating and saving the scatterplot matrix
png(file = "life_insurance_scatterMatrix.png")
pairs(ldf[,c(1,3,4,7)])
dev.off()

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

#pindecoding
pin <- read.csv("pinCode.csv")

pindec <- function(pincode){
  
  temp <- pin[which(pin$pincode == pincode),c(6,10)]
  data <- temp[1,]
  return(data)
}

city <- pindec(uli[1,6])[1,1]

state <- pindec(uli[1,6])[1,2]


statecode <- function(state){
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


code <- statecode(state)





#prediction
out <- predict(life, data.frame(age = lage , sex = lsex , bmi = lbmi , children = lchild , smoker = lsmoke ),
        interval = 'prediction')

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
}else

i <- 1
while(i<4){
  
  out[1,i] <- out[1,i] + disaterFactor
i <- i + 1
}

#writing it to a file
write.table(out, file = "life_output.txt", append = TRUE, quote = FALSE, sep = ",",
            eol = "\n", na = "NA", dec = ".", row.names = FALSE,
            col.names = TRUE,qmethod = c("escape", "double"),
            fileEncoding = "")
print(out)

