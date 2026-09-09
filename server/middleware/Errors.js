import ErrorHandler from "../utils/errorHandler.js";

const ErrorThrow = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';

    // wrong mongodb error
    if (err.name === "CastError") {
        const message = `Resource not found. Invalid : ${err.path}`
        err = new ErrorHandler(400, message)
    }

    // Mongoose dublicate key error
    if (err.code === 11000) {
        const message = `Dublicate ${Object.keys(err.keyValue)} Entered`
        err = new ErrorHandler(400, message)
    }

    // Wrong JWT error
    if (err.name === "jsonWebTokenError") {
        const message = `Json web token is invalid, try again `
        err = new ErrorHandler(400, message)
    }
    // JWT expire error
    if (err.name === "TokenExpiredError") {
        const message = `Json web token is Expired, try again `
        err = new ErrorHandler(400, message)
    }


    res.status(err.statusCode).json({
        success: false,
        message: err.message,
    })
}

export default ErrorThrow;