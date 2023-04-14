const fs = require('fs');
const request = require('request');
const hubspot = require('@hubspot/api-client')
const hubspotClient = new hubspot.Client({ developerApiKey: 'b9a0493b-adf1-4ed8-bad9-2ef2a949d11c'})

const deactivatedPropertyIds = [];
const deactivatedUsers = [];

(async function() {
    //Gathers deactivated property's account_ids
async function readPropertyFile(){
    try{
        const jsonData = await fs.readFileSync('./data/properties.json', 'utf8');
        const propertyData = await JSON.parse(jsonData);

        for(const property of propertyData){
            if(property.status == 'deactivated'){
                deactivatedPropertyIds.push(property.account_id);
            }
        }

        return deactivatedPropertyIds

    } catch(error){
        console.error(error);
    }
    

}


//Gathers User associated with deactivated properties
async function readUserFile(deactivatedPropertyIds){
    try{
        const jsonData = await fs.readFileSync('./data/users.json', 'utf8');
        const userData = await JSON.parse(jsonData);

        
        for(const user of userData){
            for(accountId of user.associated_accounts){
                if(deactivatedPropertyIds.includes(accountId.toString())){
                    deactivatedUsers.push(user)
                    break;
                }
            }    
        }

        return deactivatedUsers

    } catch(error){
        console.error(error);
    }

}


//calls functions to gather data
await readPropertyFile()
await readUserFile(deactivatedPropertyIds)


//Creates contacts and adds it to hubspot list
for(let i = 0; i < deactivatedUsers.length; i++){
    const options = { method: 'POST',
    url: 'https://api.hubapi.com/contacts/v1/contact/createOrUpdate/email/testingapis@hubspot.com/',
    headers: 
    {  'Content-Type': 'application/json',
            'Authorization': `Bearer pat-na1-657d29b9-001e-4dcc-85d6-2f88b07b13f6`  
    },
    body: 
    { properties:
        [{ property: 'firstname', value: deactivatedUsers[i].first_name },
        { property: 'lastname', value: deactivatedUsers[i].last_name },
        { property: 'company', value: deactivatedUsers[i].company },
        { property: 'website', value: deactivatedUsers[i].company_domain },
        { property: 'email', value: deactivatedUsers[i].email },
        { property: 'phone', value: deactivatedUsers[i].phone },]},
    json: true };
    request(options, function (error, response, body_example) {

        if (error){
            throw new Error(error);
            return;
        } 
        
        const option2 = { method: 'POST',
        url: 'https://api.hubapi.com/contacts/v1/lists/3/add',
        headers: 
         {  'Content-Type': 'application/json',
              'Authorization': `Bearer pat-na1-657d29b9-001e-4dcc-85d6-2f88b07b13f6`  
        },
        body: 
         {
          "vids": [
              body_example.message != undefined ? body_example.identityProfile.vid : body_example.vid
            ],
            "emails": [
              "testingapis@hubspot.com"
            ]
          },
              json: true};
      
      request(option2, function (error, response, body) {
        if (error){
            throw new Error(error);
            return;
        } 
      
        console.log(body);
      });
    });
    
}
})()




//Deactivated property ids
// [ '40', '43', '45' ]
//try filter method instead of second for loop


// users associated accounts
// "associated_accounts": [
//     44,
//     45,
//     42,
//     46
// ]

//api key
//b9a0493b-adf1-4ed8-bad9-2ef2a949d11c
//pat-na1-30d9b313-11f1-44e5-a8ba-2094edac456f
//pat-na1-657d29b9-001e-4dcc-85d6-2f88b07b13f6

//userId
//50924623

// {
//     "id": "string",
//     "first_name": "string",
//     "last_name": "string",
//     "company": "string",
//     "company_domain": "string",
//     "email": "string",
//     "phone": "string",
//     "associated_accounts": [1, 2, 3]
//   }