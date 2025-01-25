const UserService = require("../services/user-service");
const auth = require("./middleware/auth");
const { SubscribeMessage } = require("../utils");
const User = require("../database/models/User");
let print=console.log
userRoutes = (app, channel) => {
  const service = new UserService();

  SubscribeMessage(channel, service);

// ROUTE USED TO SEE PROFILE  OF A SELLER. LIKE WHEN YOU GO ON PRODUCT DETAILS YOU SHOULD BE ABLE TO SEE THE SELLER 
  app.get("/seller-profile/:id",async (req,res)=>{
    const user=await User.findById(req.params.id)
    const populateProfile= await user.populate('profile')
    res.status(200).json(populateProfile.profile)
  })
  app.post("/signup", async (req, res, next) => {
    try {
      const { email, password, phone, role } = req.body;

      const { data } = await service.SignUp({ email, password, phone, role });      
      res.json(data);
    } catch (err) {
      res.json(err);
    }
  });

  app.post("/login", async (req, res, next) => {
    const { email, password } = req.body;

    const { data } = await service.SignIn({ email, password });

    res.json(data);
  });

  //EDIT ROFILE

  app.put("/profile", auth, async (req, res, next) => {
try{    const { _id } = req.user;

    const { name,img,gender,street, postalCode, city, country,about } = req.body;

    const { data } = await service.EditProfile(_id, {
      name,
      img,
      gender,
      street,
      postalCode,
      city,
      country,
      about
    });

    
    res.status(200).json(data);
  }catch(e){
    console.log(e)
  }
  }

);


  app.get("/", auth, async (req, res, next) => {
    const user=await service.GetUser(req.user._id)
    return res.status(200).json(user);
  });

};

module.exports = userRoutes;
