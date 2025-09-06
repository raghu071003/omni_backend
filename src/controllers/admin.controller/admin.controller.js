const User = require("../models/users.model");

//////////User////////////


//////// GROUP //////////
////Team, Sub Team, Common, Custom 1/2/3, Actions - Edit/Delete

const addGroup = async(req,res)=>{
    
  const {teamName,description,team_id,subTeamName,subTeamDescription} = req.body;
  if(teamName){
    const team = await Team.create({
        name:teamName,
        description,
        ///Change when authentication is added
        organization_id:"68b5a94c5991270bf14b9d13"
    })
  }else{
    const subTeam = await SubTeam.create({
        name:subTeamName,
        description,
        ///Change when authentication is added
        organization_id:"68b5a94c5991270bf14b9d13"
    })
    return res.status(201).json({
        success:true,
        message:"Sub Team added successfully",
        data:subTeam
    })
  }
}








///////////Module///////////





///////////ROLES////////////






/////////ASSSIGNMENT/////////



