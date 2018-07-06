const Joi = require('joi')
const categoryModel = require('models/categoryModel')

const dbConnection = require('lib/dbConnection')

const getSubCategoryListController = async (req, res) => {
  const { main_id } = req.params
  
  const validation = Joi.validate(main_id, Joi.number().required())
  
  if (validation.error) {
    throw new Error(validation.error)
  }

  const connection = await dbConnection()
  try {
    const category_info = await categoryModel.selectSubListByMain(connection, main_id)
    const data = {
      category_info,
    }
    res.status(200)
    res.send({ data })
  } catch (e) {
    res.status(500)
    res.send(e)
  }
  connection.release()
}


module.exports = {
  getSubCategoryListController,
}
