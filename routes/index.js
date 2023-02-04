var express = require("express");
var router = express.Router();
// var data = require("../doc.js");
const fs = require("fs");

let rawdata;
var data, accounts;

fs.readFile("data.json", (err, datas) => {
  if (err) throw err;
  rawdata = JSON.parse(datas);
  data = rawdata.data;
  accounts = rawdata.accounts;
});

/* GET home page. */
router.get("/", function (req, res, next) {
  // neu ton tai session thi chuyen den trang admin hoac employee
  if (req.session.user) {
    console.log(req.session.user.type);
    if (req.session.user.type == "admin") {
      //truyen ve cac thong tin can thiet cho trang admin nhu userType va datas
      //usertype de biet dang o trang admin hay employee
      //datas de biet du lieu can hien thi (o day la danh sach cac san pham)
      //TODO : render admin page
      res.render("index", {
        userType: req.session.user.type,
        datas: data,
        err: "",
      });
    } else {
      res.render("index", {
        userType: req.session.user.type,
        datas: data,
        err: "",
      });
    }
  } else {
    // neu khong ton tai session thi chuyen den trang login
    res.redirect("/login");
  }
});

//check session
router.get("/get_session", function (req, res, next) {
  if (req.session.user) {
    return res
      .status(200)
      .json({ status: "success", session: req.session.user });
  } else {
    return res.status(200).json({ status: "fail", session: "no session" });
  }
});

//destroy session
router.get("/destroy_session", function (req, res, next) {
  req.session.destroy(function (err) {
    return res.status(200).json({ status: "success", session: "destroyed" });
  });
});

// GET login page
router.get("/login", function (req, res, next) {
  res.render("login", { err: "" });
});

// POST login page
router.post("/login", function (req, res, next) {
  // lay username va password tu form
  const username = req.body.username;
  const password = req.body.password;
  // kiem tra username va password co ton tai trong data
  try {
    let user = accounts.find(
      (x) => x.username == username && x.password == password
    );
    if (user) {
      // neu ton tai thi tao session theo 2 loai la admin va employee
      if (user.type == "admin") {
        req.session.user = {
          type: "admin",
          username: `${username}`,
          password: `${password}`,
        };
      } else {
        req.session.user = {
          type: "employee",
          username: `${username}`,
          password: `${password}`,
        };
      }
      // chuyen den trang admin hoac employee
      res.redirect("/");
    } else {
      // neu khong ton tai thi quay lai trang login va hien thi thong bao
      res.render("login", {
        username: username,
        password: password,
        err: "Invalid username or password",
      });
    }
  } catch (err) {
    console.log(err);
  }
});

// GET logout page
router.get("/logout", function (req, res, next) {
  // destroy session
  req.session.destroy(function (err) {
    // chuyen den trang login
    res.redirect("/login");
  });
});

//GET : add new product
router.get("/add_product", function (req, res, next) {
  if (!req.session.user) {
    res.redirect("/");
  }
  if (req.session.user.type != "admin") {
    res.redirect("/", { err: "You don't have permission to access this page" });
  }
  res.render("add_product", { err: "" });
});

//POST : add new product
router.post("/add_product", function (req, res, next) {
  const productName = req.body.productName;
  const quantity = req.body.quantity;
  const discount = req.body.discount;
  const threshold = req.body.threshold;
  try {
    let product = data.find((x) => x.productName == productName);
    if (product) {
      res.render("add_product", {
        err: "Product name is already exist",
      });
    } else {
      data.push({
        productName: productName,
        quantity: Number(quantity),
        discount: {
          discount: Number(discount),
          threshold: Number(threshold),
        },
      });
      console.log(data);
      rawdata = JSON.stringify({ data, accounts }, null, 2);

      // fs.writeFileSync("data.json", rawdata, "utf8");
      fs.writeFile("data.json", rawdata, "utf8", (err) => {
        if (err) {
          console.log(err);
        }
      });

      res.render("add_product", {
        err: "Add product successfully",
      });
    }
  } catch (err) {
    console.log(err);
  }
});

//TODO : edit product
router.get("/edit_product/:productName", function (req, res, next) {
  if (!req.session.user) {
    res.redirect("/");
  }
  if (req.session.user.type != "admin") {
    res.redirect("/");
  }
  let { productName } = req.params;
  productName = decodeURIComponent(productName);
  try {
    let product = data.find((x) => x.productName == productName);
    if (product) {
      res.render("edit_product", {
        err: "",
        productName: product.productName,
        quantity: product.quantity,
        discount: product.discount.discount,
        threshold: product.discount.threshold,
      });
    } else {
      res.render("edit_product", {
        err: "Product name is not exist",
        productName: "nothing",
        quantity: "nothing",
        discount: "nothing",
        threshold: "nothing",
      });
    }
  } catch (err) {
    console.log(err);
  }
});

router.post("/edit_product", function (req, res, next) {
  const productName = req.body.productName;
  const quantity = req.body.quantity;
  const discount = req.body.discount;
  const threshold = req.body.threshold;
  try {
    let product = data.find((x) => x.productName == productName);
    if (product) {
      product.quantity = Number(quantity);
      product.discount.discount = Number(discount);
      product.discount.threshold = Number(threshold);
      rawdata = JSON.stringify({ data, accounts }, null, 2);
      // fs.writeFileSync("data.json", rawdata, "utf8");
      fs.writeFile("data.json", rawdata, "utf8", (err) => {
        if (err)
        console.log(err);
      });
      res.render("edit_product", {
        err: "Edit product successfully",
        productName: product.productName,
        quantity: product.quantity,
        discount: product.discount.discount,
        threshold: product.discount.threshold,
      });
    } else {
      res.render("edit_product", {
        err: "you can not change the name of the product",
        productName: "nothing",
        quantity: "nothing",
        discount: "nothing",
        threshold: "nothing",
      });
    }
  } catch (err) {
    console.log("loi: POST /edit_product");
    console.log(err);
  }
});

//TODO : delete product

//TODO : change password
router.get("/change_password", function (req, res, next) {
  if (!req.session.user) {
    res.redirect("/");
  }
  res.render("change_password", { err: "" });
});

router.post("/change_password", function (req, res, next) {
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;
  const confirmPassword = req.body.confirmPassword;
  try {
    if (req.session.user.password == oldPassword) {
      if (newPassword == confirmPassword) {
        rawdata = rawdata.replace(oldPassword, newPassword);
        // fs.writeFileSync("data.json", rawdata);
        fs.writeFile("data.json", rawdata, "utf8", (err) => {
          if (err)
          console.log(err);
        });

        res.render("change_password", {
          err: "Change password successfully",
        });
      } else {
        res.render("change_password", {
          err: "New password and confirm password are not the same",
        });
      }
    } else {
      res.render("change_password", {
        err: "Old password is not correct",
      });
    }
  } catch (err) {
    console.log(err);
  }
});

//TODO : add new account

//TODO : delete account

module.exports = router;
