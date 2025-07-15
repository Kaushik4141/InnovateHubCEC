import multer from "multer";
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      
      cb(null, file.originalname)
      //You can also use a custom naming convention here it should be unique but here it is not needed mandatory
      // cb(null, Date.now() + '-' + file.originalname)
    }
  })
  
export const upload = multer({ 
    storage, 
})