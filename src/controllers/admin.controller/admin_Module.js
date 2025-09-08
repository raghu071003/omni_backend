
const Module = require("../../models/moduleOrganization.model");

const addModule = async(req,res)=>{
  try {
    const {
      title,
      type,
      content,
      file_url,
      sub_team_id,
      status,
      classification,
      team_id
    } = req.body;

    // Optional: set this from auth middleware
    const created_by = req.user?.id || null;

    // Validate required fields
    if (!title || !type) {
      return res.status(400).json({
        success: false,
        message: 'Title and type are required.'
      });
    }

    if (!['PDF', 'DOCX', 'Theory'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid content type. Must be PDF, DOCX, or Theory.'
      });
    }

    // At least one of content or file_url should be present
    if (type === 'Theory' && !content) {
      return res.status(400).json({
        success: false,
        message: 'Theory content requires a text body.'
      });
    }

    if ((type === 'PDF' || type === 'DOCX') && !file_url) {
      return res.status(400).json({
        success: false,
        message: `${type} content requires a file URL.`
      });
    }
    const moduleOrganization = await Module.create({
      name:title,
      organization_id: "68bc0898fdb4a64d5a727a60",
      created_by: "68bc1d953f117b638adf49dc",
      classification,
      status,
      team_id,  
      content,
      sub_team_id,
      module_files:[req.uploadedFile?.url],
      pushed_by:"68bc1d953f117b638adf49dc"
    });
    return res.status(201).json({
      success: true,
      message: 'Module added successfully.',
      data: moduleOrganization
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to add Module.',
      error: error.message
    });
  }
}

const editModule = async (req, res) => {
  try {
    const {
      title,
      type,
      content,
      file_url,
      sub_team_id,
      status,
      classification,
      team_id
    } = req.body;

    // Update the Content doc and get the updated document back
    const updatedContent = await Module.findOneAndUpdate(
      { uuid: req.params.id },
      {
        title,
        content,
        sub_team_id,
        status,
        classification,
        team_id,
        module_files:[req.uploadedFile?.url],
      },
      { new: true, runValidators: true }
    );

    if (!updatedContent) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }


    return res.status(200).json({
      success: true,
      message: "Module edited successfully",
      data: updatedContent,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to edit module", error: error.message });
  }
};

const deleteModule = async(req,res)=>{
    try {
        const deletedContent = await Module.findOneAndDelete({uuid:req.params.id})
        return res.status(200).json({
            success:true,
            message:"Module deleted successfully",
            data:deletedContent
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Failed to delete module",
            error:error.message
        })
    }
}

const previewModule = async(req,res)=>{
    try {
        const content = await Module.findOne({uuid:req.params.id})
        return res.status(200).json({
            success:true,
            message:"Module previewed successfully",
            data:content
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Failed to preview module",
            error:error.message
        })
    }
}


const searchModules = async (req, res) => {
  try {
    const searchTerm = req.query.search?.trim();
    const {classification,team_id,status} = req.query;
    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: "Search term is required",
      });
    }
    const regex = new RegExp(searchTerm, "i"); // case-insensitive regex
    const modules = await Module.find({
      name: regex,
      $or: [
        { classification },
        { team_id }, // make sure team_id is a String, else adjust
        { status },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Modules searched successfully",
      data: modules,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to search modules",
      error: error.message,
    });
  }
};

module.exports = {
  addModule,
  editModule,
  deleteModule,
  previewModule,
  searchModules,
};