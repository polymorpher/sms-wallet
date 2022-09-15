const { StatusCodes } = require('http-status-codes')
const constants = require('./constants')

const utils = {

  parseError: (ex) => {
    let error = ex.toString()
    if (error && error.indexOf(constants.ReasonGiven) > 0) {
      error = error.slice(error.indexOf(constants.ReasonGiven) + constants.ReasonGiven.length)
      return { success: false, code: StatusCodes.OK, error, extra: ex.extra }
    }
    return { success: false, code: StatusCodes.INTERNAL_SERVER_ERROR, error, extra: ex.extra }
  }
}

module.exports = utils
