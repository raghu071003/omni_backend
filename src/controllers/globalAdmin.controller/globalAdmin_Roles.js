const GlobalRoles = require("../../models/globalRoles_model");

const addRole = async(req,res)=>{
    //// Changes to be made in roles model
    try {
        const {name,description,permissions} = req.body;
        const newRole = await GlobalRoles.create({
            name,
            description,
            permissions
        })
        return res.status(201).json({
            isSuccess:true,
            message:"Role added successfully",
            data:newRole
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess:false,
            message:"Failed to add role",
            error:error.message
        })
    }
}

const editRole = async(req,res)=>{
    try {
        const {name,description,permissions} = req.body;
        const updatedRole = await GlobalRoles.findOneAndUpdate({uuid:req.params.id},{
            name,
            description,
            permissions
        })
        return res.status(200).json({
            isSuccess:true,
            message:"Role updated successfully",
            data:updatedRole
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess:false,
            message:"Failed to update role",
            error:error.message
        })
    }
}

const deleteRole = async(req,res)=>{
    try {
        const deletedRole = await GlobalRoles.findOneAndDelete({uuid:req.params.id})
        return res.status(200).json({
            isSuccess:true,
            message:"Role deleted successfully",
            data:deletedRole
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess:false,
            message:"Failed to delete role",
            error:error.message
        })
    }
}
const getRoles = async(req,res)=>{
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 50;
        const skip = (page - 1) * limit;
        const roles = await GlobalRoles.find().skip(skip).limit(limit)
        const total = await GlobalRoles.countDocuments()
        return res.status(200).json({
            isSuccess:true,
            message:"Roles fetched successfully",
            data:roles,
            pagination:{
                total,
                page,
                limit,
                totalPages:Math.ceil(total/limit),
                hasNextPage:page*limit<total
            }
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess:false,
            message:"Failed to fetch roles",
            error:error.message
        })
    }
}

module.exports = {
    addRole,
    editRole,
    deleteRole,
    getRoles
}