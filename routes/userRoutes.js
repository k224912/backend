const express =require('express');
const {registerUser,authUser,allUsers}=require("../controllers/userController");
const {protect } = require ( "../middleware/authMiddleWare")
const router = express.Router();

 router.route('/').post(registerUser).get(protect,allUsers);//for searching users
 router.post('/login',authUser)
//  router.route("/").get(allUsers);

module.exports = router