const Content = require("../../models/content.model");
const OrganizationContent = require("../../models/contentOrganization.model");

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
    const organizationContent = new OrganizationContent({
      name:title,
      organization_id: "68bc0898fdb4a64d5a727a60",
      created_by: "68bc1d953f117b638adf49dc",
      classification,
      status,
      team_id,
      sub_team_id,
      module_files:[req.uploadedFile?.url],
      pushed_by:"68bc1d953f117b638adf49dc"
    });
    await organizationContent.save();
    return res.status(201).json({
      success: true,
      message: 'Content added successfully.',
      data: organizationContent
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to add content.',
      error: error.message
    });
  }
}

const editModule = async (req, res) => {
  try {
    const { title, type, content, file_url, is_active, pushable_to_orgs, status, classification, team_id } = req.body;

    // Update the Content doc and get the updated document back
    const updatedContent = await Content.findOneAndUpdate(
      { uuid: req.params.id },
      {
        title,
        content: type === 'Theory' ? content : null,
        file_url: type !== 'Theory' ? file_url : null,
        is_active: is_active !== undefined ? is_active : true,
        pushable_to_orgs: pushable_to_orgs !== undefined ? pushable_to_orgs : true,
      },
      { new: true, runValidators: true }
    );

    if (!updatedContent) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    // Update OrganizationContent using the updated content's uuid
    const updatedOrgModule = await OrganizationContent.findOneAndUpdate(
      { content_id: updatedContent.uuid },
      {
        classification,
        status,
        team_id,
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Module edited successfully",
      data: {
        content: updatedContent,
        organizationContent: updatedOrgModule,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to edit module", error: error.message });
  }
};

const deleteModule = async(req,res)=>{
    try {
        const deletedContent = await Content.findOneAndDelete({uuid:req.params.id})
        const deletedOrgModule = await OrganizationContent.findOneAndDelete({content_id:deletedContent.uuid})
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
        const content = await Content.findOne({uuid:req.params.id})
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

    // Step 1: Get content IDs for the org
    const orgContent = await OrganizationContent.find().select("content_id");
    const contentIds = orgContent.map((item) => item.content_id);

    // Step 2: Search directly in MongoDB
    const regex = new RegExp(searchTerm, "i"); // case-insensitive regex
    const content = await Content.find({
      uuid: { $in: contentIds },
      $or: [
        { title: regex },
        { classification },
        { team_id }, // make sure team_id is a String, else adjust
        { status },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Modules searched successfully",
      data: content,
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