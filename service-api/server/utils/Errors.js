const errorCode = (error) => {
  const errorName = error.name;
  let errCode = null;
  switch (errorName) {
    case 'SequelizeUniqueConstraintError': {
      errCode = 422;
      break;
    }
    default: {
      errCode = 500;
      break;
    }
  }
  return errCode;
};

export default errorCode;
