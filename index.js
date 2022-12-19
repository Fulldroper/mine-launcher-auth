(async () => {
  process.env.Prod || (await require("dotenv").config({ debug: false }));
  // init modules
  const db = new (await require("./fd-buffer")).fileBuffer("./db.json");
  const db_news = new (await require("./fd-buffer")).fileBuffer("./news.json");
  const web = (await require("fastify"))({ logger: false });
  const { v4: uuidv4 } = require('uuid');
  const stamp = () => new Date().getTime();
  const isAlive = time => stamp() - time <= process.env.LIFE_TIME
  const createLog = (text) => {
    const log = {};
    log[stamp()] = text;
    return log;
  }
  web.get("/white-list/:username/", async (req, rep) => {
    try {
      const { username } = req.params;
      rep.header("Access-Control-Allow-Origin","*")
      rep.header('Content-Type', 'application/json');
      let user
      if (user = await db.find(u => u.nickname === username)) {
        rep.send({
          res: true,
          level: user.level,
          premium: user.premium       
        })
      
      } else {
        rep.send({
          res: false
        })
      }
    } catch (error) {
      rep.send({
        err: true,
        res: false
      })
    }
  })
  // auth
  web.post("/auth", async (req, rep) => {
    rep.header('Content-Type', 'application/json');
    try {
      const { email, password, ip } = req.body;
      if (!email || !password || !ip) throw "wrong input"
      const user = await db.find(u => u.email === email && u.password === password)
      if (!user) return false;
      user.token = uuidv4()
      user.update = uuidv4()
      user.lifeTime = stamp()
      user.log.push(createLog(`login:${ip}`))
      db.set(user._id, user)
      rep.send({
        nickname: user.nickname,
        premium: user.premium,
        level: user.level,
        token: user.token,
        update: user.update,
        lifeTime: process.env.LIFE_TIME
      })
    } catch (error) {
      rep.send({
        err: process.env.Prod ? false : error
      })
    }
  });
  // reg
  web.post("/reg", async (req, rep) => {
    rep.header('Content-Type', 'application/json');
    try {
      const { email, password, nickname, ip } = req.body;
      if (!email || !password || !ip || !nickname) throw "wrong input"
      const user = {
        "_id": uuidv4(),
        "skin": undefined,
        "token": uuidv4(),
        "lifeTime": stamp(),
        "update": uuidv4(),
        "level": 1,
        "premium": false,
        "log": [createLog(`Registration:${ip}`)],
        nickname, password, email
      }
      if (!(await db.find(u => u.nickname === user.nickname || u.email === user.email))) {
        db.set(user._id, user)
        rep.send({
          token: user.token,
          update: user.update,
          lifeTime: process.env.LIFE_TIME
        })
      } else return false
    } catch (error) {
      rep.send({
        err: process.env.Prod ? false : error
      })
    }
  });
  // change pwd
  web.post("/change-password", async (req, rep) => {
    rep.header('Content-Type', 'application/json');
    try {
      const { token, password, ip } = req.body;
      if (!token || !password || !ip) throw "wrong input"
      const user = await db.find(u => u.token === token)
      if (!user) throw "user not founded"
      if (!isAlive(user.lifeTime)) return { err: "old token" }
      user.log.push(createLog(`password change:${ip}`))
      user.password = password
      db.set(user._id, user)
      rep.send({
        err: false
      })
    } catch (error) {
      rep.send({
        err: process.env.Prod ? true : error
      })
    }
  });
  // update token
  web.post("/update", async (req, rep) => {
    rep.header('Content-Type', 'application/json');
    try {
      const { token, update, ip } = req.body;
      if (!token || !update || !ip) throw "wrong input"
      const user = await db.find(u => u.token === token && u.update === update)
      if (!user) throw "user not founded"
      user.token = uuidv4()
      user.update = uuidv4()
      user.lifeTime = stamp()
      user.log.push(createLog(`update:${ip}`))
      db.set(user._id, user)
      rep.send({
        nickname: user.nickname,
        premium: user.premium,
        level: user.level,
        token: user.token,
        update: user.update,
        lifeTime: process.env.LIFE_TIME
      })
    } catch (error) {
      rep.send({
        err: process.env.Prod ? true : error
      })
    }
  });
  // check heardbeat
  web.post("/", async (req, rep) => {
    rep.header('Content-Type', 'application/json');
    try {
      const { token, ip } = req.body;
      if (!token || !ip) throw "wrong input"
      const user = await db.find(u => u.token === token)
      if (!user) throw "user not founded"
      rep.send({
        isAlive: isAlive(user.lifeTime)
      })
    } catch (error) {
      rep.send({
        err: process.env.Prod ? true : error
      })
    }
  })
  web.post("/restart", async (req, rep) => {
    rep.header('Content-Type', 'application/json');
    try {
      const { token, ip } = req.body;
      if (!token || !ip) throw "wrong input"
      const user = await db.find(u => u.token === token)
      if (!user || user.level !== 0) throw "user not founded"
      setTimeout(async () => process.exit(), 3000)
      rep.send({result: true})
    } catch (error) {
      rep.send({
        err: process.env.Prod ? true : error
      })
    }
  })
  web.post("/logs", async (req, rep) => {
    rep.header('Content-Type', 'application/json');
    try {
      const { token, ip } = req.body;
      if (!token || !ip) throw "wrong input"
      const user = await db.find(u => u.token === token)
      if (!user || user.level !== 0) throw "user not founded"
      let _log = []

      for (const key in db.date) {
        const {log, premium, level, nickname, email} = db.date[key]
        _log.push({
          premium, level, nickname, email, log: log.reverse()
        })
      }     
      rep.send(_log)
    } catch (error) {
      rep.send({
        err: process.env.Prod ? true : error
      })
    }
  })
  web.get("/news", async (_, rep) => {
    rep.header('Content-Type', 'application/json');
    try {
      rep.send(db_news.date || {}) ///
    } catch (error) {
      rep.send({
        err: process.env.Prod ? true : error
      })
    }
  })
  web.post("/news/send", async (req, rep) => {
    rep.header('Content-Type', 'application/json');
    try {
      const { token, ip, content } = req.body;
      if (!token || !ip || !content || !content?.title || ! content.body) throw "wrong input"
      const user = await db.find(u => u.token === token)
      if (!user || user.level !== 0) throw "user not founded"
      const news = {
        body: content.body,
        time: stamp(),
      }
      
      content?.img_url && (news.img_url = content.img_url)
      
      db_news.set(content.title, news)
      
      rep.send({result: true})
      
    } catch (error) {
      rep.send({
        err: process.env.Prod ? true : error
      })
    }
  })
  // run rest api server
  web.listen(
    { port: process.env.PORT || 1337, host: process.env.HOST || "0.0.0.0" },
    (err, address) => {
      if (err) throw err;
      console.log(`started on ${address}`);
    }
  );
})();
