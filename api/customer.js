const CustomerService = require("../services/customer-service");
const auth = require("./middlewares/auth");
const { SubscribeMessage } = require("../utils");

customerRoutes = (app, channel) => {
  const service = new CustomerService();

  SubscribeMessage(channel, service);

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

  app.post("/address", auth, async (req, res, next) => {
    const { _id } = req.user;

    const { street, postalCode, city, country } = req.body;

    const { data } = await service.AddNewAddress(_id, {
      street,
      postalCode,
      city,
      country,
    });

    res.json(data);
  });

  app.get("/profile", auth, async (req, res, next) => {
    console.log("IN PROFILE ROUTE", req.user);

    const { _id } = req.user;
    const { data } = await service.GetProfile({ _id });
    res.json(data);
  });

  app.get("/cart", auth, async (req, res, next) => {
    const { _id } = req.user;
    const { data } = await service.GetCart(_id);

    return res.json(data);
  });

  app.get("/wishlist", auth, async (req, res, next) => {
    const { _id } = req.user;
    const { data } = await service.GetWishList(_id);
    return res.status(200).json(data);
  });

  app.get("/", auth, (req, res, next) => {
    return res.status(200).json({ msg: req.user });
  });
};

module.exports = customerRoutes;
