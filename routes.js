// routes.js
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export default function registerRoutes({
  app,
  models,
  JWT_SECRET,
  sequelize,
  Op,
  logRequest
}) {
  const authenticateToken = (req, res, next) => {
    const token = req.cookies?.token;
    console.log(token);
    if (!token) return res.render("login", { error: "User not logged in" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.render("login", { error: "Invalid credentials" });
      req.user = user;
      next();
    });
  };

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  app.get("/", (req, res) => res.render("login", { error: null }));

  app.post("/auth", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).render("login", { error: "Username and password are required" });

    const user = await Admin.findOne({ where: { username } });
    const valid = user && (await bcrypt.compare(password, user.password));
    if (!valid)
      return res.status(400).render("login", { error: "Invalid username or password" });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1d" });
    console.log(token);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400000,
    });

    return res.redirect("/dashboard");
  });

  app.get("/logout", (req, res) => {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    res.redirect("/");
  });

  app.get("/xdashboard", authenticateToken, (req, res) => {
    res.render("index");
  });

  app.all('/dyndns', async (req, res) => {
    const dyndns = logRequest(req);

    try {
      await Logs.create({
        raw: req.toString(),
        content: dyndns
      });

      res.status(200).send({ success: true, message: "Logs captured", data: dyndns });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "Failed to capture",
        error: error.message
      });
    }
  });

  app.get('/dashboard', authenticateToken, async (req, res) => {
    try {
      const logs = await Logs.findAll({ order: [["createdAt", "DESC"]] });
      res.render("index", { logs: logs });
    } catch (error) {
      res.status(500).send({ success: false, message: "Failed to fetch data", error: error.message });
    }
  });

  app.get('/cities', async (req, res) => {
    try {
      const cities = await models.Cities.findAll({ order: [["city", "DESC"]] });
      res.render("cities", { cities: cities });
    } catch (error) {
      res.status(500).send({ success: false, message: "Failed to fetch data", error: error.message });
    }
  });

  app.post('/newCity', async (req, res) => {
    console.log("Adding new city...");
    console.log(req.body);
    const { city, country, latitude, longitude } = req.body;
    const newCity = await models.Cities.create({
      city: city,
      country: country,
      latitude: latitude,
      longitude: longitude,
    });
    try {
      const cities = await models.Cities.findAll({ order: [["city", "DESC"]] });
      res.render("cities", { cities: cities });
    } catch (error) {
      res.status(500).send({ success: false, message: "Failed to fetch data", error: error.message });
    }
  });

  app.get('/cities/:cityId', async (req, res) => {
    try {
      const climateData = await models.Climate.findAll({
        include: { model: models.Cities, attributes: ["city", "country"] },
        order: [
          [models.Cities, "city", "ASC"],
          ["month", "ASC"]
        ],
        raw: true,
        nest: true,
      });

      // Attributes to show in table rows (must match your schema keys)
      const attributes = [
        "avgHighTemp",
        "avgLowTemp",
        "avgRainfallmm",
        "avgRainDays",
        "avgSunshineHours",
      ];

      // Data structure: { [city]: { [attribute]: { month: value, ... } } }
      const dataByCity = {};

      climateData.forEach((row) => {
        const cityName = row.City.city;

        if (!dataByCity[cityName]) {
          dataByCity[cityName] = {};
          attributes.forEach(attr => {
            dataByCity[cityName][attr] = Array(12).fill(null); // 12 months, null default
          });
        }

        attributes.forEach(attr => {
          if (row[attr] !== undefined && row[attr] !== null) {
            // month is 1-based, array index is 0-based
            dataByCity[cityName][attr][row.month - 1] = row[attr];
          }
        });
      });

      console.log(dataByCity);
      console.log(attributes);
      console.log(months);
      res.render("climate", { dataByCity, attributes, months });
    } catch (error) {
      res.status(500).send({ success: false, message: "Failed to fetch data", error: error.message });
    }
  });

  app.post('/addClimate', async (req, res) => {
    console.log("Adding climate data...");
    console.log(req.body);
    //const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
    const { cityId, attribute, january, february, march, april, may, june, july, august, september, october, november, december } = req.body;
    const months = [january, february, march, april, may, june, july, august, september, october, november, december];

    for (let i=0; i < months.length; i++) {
      console.log("Adding month " + i + " with value: " + months[i]);
      const newClime = await models.Climate.create({
        cityId: cityId,
        attribute: attribute,
        month: i+1,
        value: months[i],
      });
    }

    try {
      const cities = await Cities.models.findAll({ order: [["city", "DESC"]] });
      res.render("cities", { cities: cities });
    } catch (error) {
      res.status(500).send({ success: false, message: "Failed to fetch data", error: error.message });
    }
  });

  app.get('/map', async (req, res) => {
    try {
      const climateData = await models.Climate.findAll({
        include: { model: models.Cities, attributes: ["city", "country", "latitude", "longitude"] },
        order: [
          [models.Cities, "city", "ASC"],
          ["month", "ASC"]
        ],
        raw: true,
        nest: true,
      });

      console.log(climateData);

      res.render("map", { climateData: climateData });
    } catch (error) {
      res.status(500).send({ success: false, message: "Failed to fetch data", error: error.message });
    }
  });

  app.get('/map/:month', async (req, res) => {
    const month = parseInt(req.params.month, 10);

    const data = await models.Climate.findAll({
      where: { month },
      include: [{ model: models.Cities, as: 'City' }]
    });

    // Send raw values
    const payload = data.map(entry => ({
      latitude: entry.City.latitude,
      longitude: entry.City.longitude,
      avgHighTemp: entry.avgHighTemp,
      avgLowTemp: entry.avgLowTemp,
      avgRainfallmm: entry.avgRainfallmm,
      avgSunshineHours: entry.avgSunshineHours,
    }));

    res.json(payload)
  });
}
