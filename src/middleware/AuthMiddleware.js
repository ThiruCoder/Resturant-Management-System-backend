import jwt from 'jsonwebtoken';

const AuthMiddleware = (req, res, next) => {
  const headerAuth = req.headers['authorization'];

  if (!headerAuth || !headerAuth.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Authorization header is missing or invalid.',
      success: false
    })
  }
  const token = headerAuth.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      message: 'Token is a invalid.',
      success: false
    })
  }
  if (!token || token === undefined || token === null) {
    return res.status(401).json({
      message: 'Token is not available!',
      success: false
    })
  }
  try {
    const decode = jwt.verify(token, process.env.JWT_SCRETE_KEY ?? '6953626eb228448751asd9f9917');
    if (!decode || decode === undefined || decode === null) {
      return res.status(401).json({
        message: 'Token is expired!, please login to continue this proccess',
        success: false
      })
    }

    req.user = decode
    next()
  } catch (error) {
    console.log(error)
    return res.status(200).json({
      message: 'Something went wrong please login and continue!',
      success: false
    });
  }
}

export { AuthMiddleware };